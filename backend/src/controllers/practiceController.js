const ProblemGenerator = require('../services/problemGenerator');

class PracticeController {
    constructor() {
        // 在内存中存储练习历史和错题
        global.practiceHistory = [];
        global.wrongProblems = [];
    }

    async startPractice(req, res) {
        try {
            console.log('Received start practice request:', req.body);
            const { grade, count = 10 } = req.body;
            console.log('Generating problems for grade:', grade, 'count:', count);
            
            // 清除之前的题目记录
            ProblemGenerator.clearRecentProblems();
            
            const problems = [];
            let failedAttempts = 0;
            const maxFailedAttempts = 3;
            
            for (let i = 0; i < count; i++) {
                console.log(`Generating problem ${i + 1}`);
                const problem = ProblemGenerator.generateProblem(grade);
                
                if (!problem) {
                    failedAttempts++;
                    console.error(`Failed to generate problem ${i + 1}`);
                    if (failedAttempts >= maxFailedAttempts) {
                        throw new Error('Failed to generate problems after multiple attempts');
                    }
                    i--; // 重试这个题目
                    continue;
                }
                
                problems.push(problem);
            }

            if (problems.length !== count) {
                throw new Error(`Failed to generate ${count} problems`);
            }

            const practice = {
                id: Date.now(),
                grade,
                problems: problems,
                startTime: new Date(),
                answers: new Array(problems.length).fill(null),
                isCompleted: false
            };

            global.practices.push(practice);
            console.log('Created practice:', practice.id);
            
            res.json({
                code: 200,
                data: practice,
                message: "Practice started successfully"
            });
        } catch (error) {
            console.error('Error in startPractice:', error);
            res.status(500).json({
                code: 500,
                message: error.message || "Failed to start practice"
            });
        }
    }

    async submitAnswer(req, res) {
        try {
            const { practiceId, problemIndex, answer } = req.body;
            console.log('Submitting answer:', { practiceId, problemIndex, answer });

            const practice = global.practices.find(p => p.id === parseInt(practiceId));
            
            if (!practice) {
                console.error('Practice not found:', practiceId);
                return res.status(404).json({
                    code: 404,
                    message: 'Practice not found'
                });
            }

            if (!practice.problems[problemIndex]) {
                console.error('Problem not found:', problemIndex);
                return res.status(404).json({
                    code: 404,
                    message: 'Problem not found'
                });
            }

            const problem = practice.problems[problemIndex];
            const userAnswer = parseFloat(answer);
            const isCorrect = Math.abs(problem.answer - userAnswer) < 0.0001;

            practice.answers[problemIndex] = {
                value: userAnswer,
                isCorrect: isCorrect
            };

            // 如果答错了，添加到错题集
            if (!isCorrect) {
                const wrongProblem = {
                    id: Date.now(),
                    problem: problem,
                    wrongAnswer: userAnswer,
                    wrongCount: 1,
                    lastWrongDate: new Date(),
                    mastered: false
                };
                
                const existingWrong = global.wrongProblems.find(
                    wp => wp.problem.text === problem.text
                );

                if (existingWrong) {
                    existingWrong.wrongCount++;
                    existingWrong.lastWrongDate = new Date();
                } else {
                    global.wrongProblems.push(wrongProblem);
                }
            }

            console.log('Answer submitted successfully:', { isCorrect });
            res.json({
                code: 200,
                data: { isCorrect },
                message: "Answer submitted successfully"
            });
        } catch (error) {
            console.error('Error submitting answer:', error);
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    async finishPractice(req, res) {
        try {
            const { practiceId } = req.body;
            const practice = global.practices.find(p => p.id === parseInt(practiceId));
            
            if (!practice) {
                return res.status(404).json({
                    code: 404,
                    message: 'Practice not found'
                });
            }

            practice.endTime = new Date();
            practice.totalTime = (practice.endTime - practice.startTime) / 1000;
            practice.isCompleted = true;

            const answeredProblems = practice.answers.filter(a => a !== null);
            const totalAnswered = answeredProblems.length;
            const correctAnswers = answeredProblems.filter(a => a.isCorrect).length;
            
            practice.score = Math.round((correctAnswers / totalAnswered) * 100) || 0;
            practice.accuracy = ((correctAnswers / totalAnswered) * 100).toFixed(1) || 0;

            // 添加到练习历史
            const historyRecord = {
                id: practice.id,
                date: new Date(),
                grade: practice.grade,
                problemCount: practice.problems.length,
                correctCount: correctAnswers,
                totalAnswered: totalAnswered,
                score: practice.score,
                accuracy: practice.accuracy,
                totalTime: practice.totalTime,
                problems: practice.problems.map((p, i) => ({
                    ...p,
                    userAnswer: practice.answers[i]?.value,
                    isCorrect: practice.answers[i]?.isCorrect
                }))
            };

            global.practiceHistory.push(historyRecord);

            res.json({
                code: 200,
                data: {
                    score: practice.score,
                    totalTime: practice.totalTime,
                    correctCount: correctAnswers,
                    totalCount: totalAnswered,
                    accuracy: practice.accuracy
                },
                message: "Practice completed successfully"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取练习历史
    async getPracticeHistory(req, res) {
        try {
            const { grade, startDate, endDate } = req.query;
            let history = [...global.practiceHistory];

            if (grade) {
                history = history.filter(h => h.grade === parseInt(grade));
            }

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                history = history.filter(h => {
                    const date = new Date(h.date);
                    return date >= start && date <= end;
                });
            }

            res.json({
                code: 200,
                data: history,
                message: "Success"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    // 获取错题集
    async getWrongProblems(req, res) {
        try {
            const { grade, operation } = req.query;
            let wrongProblems = [...global.wrongProblems];

            if (grade) {
                wrongProblems = wrongProblems.filter(wp => wp.problem.grade === parseInt(grade));
            }

            if (operation) {
                wrongProblems = wrongProblems.filter(wp => wp.problem.operation === operation);
            }

            res.json({
                code: 200,
                data: wrongProblems,
                message: "Success"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    async removeWrongProblem(req, res) {
        try {
            const { problemId } = req.body;
            
            // 从错题集中移除
            global.wrongProblems = global.wrongProblems.filter(
                wp => wp.id !== problemId
            );

            res.json({
                code: 200,
                message: "Problem removed from wrong problems list"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}

module.exports = new PracticeController(); 