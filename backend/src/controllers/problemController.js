const ProblemGenerator = require('../services/problemGenerator');

class ProblemController {
    async generateProblems(req, res) {
        try {
            const { grade, count = 10 } = req.body;
            const problems = [];

            for (let i = 0; i < count; i++) {
                const problem = ProblemGenerator.generateProblem(grade);
                problem.id = Date.now() + i;
                problem.text = `${problem.num1} ${problem.operation} ${problem.num2} = ?`;
                problems.push(problem);
            }

            res.json({
                code: 200,
                data: problems,
                message: "Success"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    async getProblems(req, res) {
        try {
            const { grade } = req.query;
            let problems = global.problems;
            
            if (grade) {
                problems = problems.filter(p => p.grade === parseInt(grade));
            }

            res.json({
                code: 200,
                data: problems,
                message: "Success"
            });
        } catch (error) {
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}

module.exports = new ProblemController(); 