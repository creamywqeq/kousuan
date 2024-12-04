class ProblemGenerator {
    constructor() {
        this.gradeConfigs = {
            1: {
                maxNum: 20,
                operations: ['+', '-'],
                rules: {
                    '+': { maxResult: 20 },
                    '-': { noNegative: true, maxNum1: 20 }
                },
                description: '20以内的加减法'
            },
            2: {
                maxNum: 100,
                operations: ['+', '-'],
                rules: {
                    '+': { maxResult: 100, minNum: 20 },
                    '-': { noNegative: true, maxNum1: 100, minNum: 20 }
                },
                description: '100以内的加减法'
            },
            3: {
                maxNum: 1000,
                operations: ['+', '-', '*'],
                rules: {
                    '+': { maxResult: 1000, minNum: 100 },
                    '-': { noNegative: true, maxNum1: 1000, minNum: 100 },
                    '*': { maxFactor: 9, minFactor: 2 }
                },
                description: '1000以内的加减法和乘法口诀'
            },
            4: {
                maxNum: 10000,
                operations: ['+', '-', '*', '÷'],
                rules: {
                    '+': { maxResult: 10000, minNum: 1000 },
                    '-': { noNegative: true, maxNum1: 10000, minNum: 1000 },
                    '*': { maxFactor: 99, minFactor: 10 },
                    '÷': { wholeDivision: true, maxDivisor: 9 }
                },
                description: '万以内的四则运算'
            },
            5: {
                maxNum: 100000,
                operations: ['+', '-', '*', '÷'],
                rules: {
                    '+': { maxResult: 100000, minNum: 10000 },
                    '-': { noNegative: true, maxNum1: 100000, minNum: 10000 },
                    '*': { maxFactor: 999, minFactor: 100 },
                    '÷': { maxDecimals: 1, maxDivisor: 99 }
                },
                description: '十万以内的四则运算'
            },
            6: {
                maxNum: 1000000,
                operations: ['+', '-', '*', '÷'],
                rules: {
                    '+': { maxResult: 1000000, minNum: 100000 },
                    '-': { noNegative: true, maxNum1: 1000000, minNum: 100000 },
                    '*': { maxFactor: 9999, minFactor: 1000 },
                    '÷': { maxDecimals: 2, maxDivisor: 999 }
                },
                description: '百万以内的四则运算'
            }
        };
        this.recentProblems = new Set();
    }

    generateProblem(grade, difficulty = 'medium') {
        try {
            const config = this.gradeConfigs[grade];
            if (!config) {
                throw new Error(`Invalid grade: ${grade}`);
            }

            let attempts = 0;
            const maxAttempts = 20;
            let problem = null;

            while (attempts < maxAttempts) {
                const operation = this.getRandomOperation(config.operations);
                let num1, num2;

                [num1, num2] = this.generateNumbers(grade, operation, config.rules[operation], difficulty);
                
                if (!this.isValidProblem(num1, num2, operation, config.rules[operation])) {
                    attempts++;
                    continue;
                }

                const answer = this.calculateAnswer(num1, num2, operation);
                const problemText = `${num1} ${operation} ${num2} = ?`;

                if (!this.recentProblems.has(problemText)) {
                    problem = {
                        id: Date.now() + attempts,
                        num1: Math.round(num1),
                        num2: Math.round(num2),
                        operation,
                        answer: operation === '÷' ? Number(answer.toFixed(2)) : Math.round(answer),
                        grade,
                        difficulty,
                        text: problemText
                    };
                    
                    this.recentProblems.add(problemText);
                    
                    if (this.recentProblems.size > 100) {
                        const firstItem = this.recentProblems.values().next().value;
                        this.recentProblems.delete(firstItem);
                    }
                    
                    break;
                }
                
                attempts++;
            }

            if (!problem) {
                const [num1, num2] = this.getSafeNumbers(grade, config.operations[0]);
                const operation = config.operations[0];
                const answer = this.calculateAnswer(num1, num2, operation);
                
                problem = {
                    id: Date.now(),
                    num1,
                    num2,
                    operation,
                    answer,
                    grade,
                    difficulty,
                    text: `${num1} ${operation} ${num2} = ?`
                };
            }

            return problem;
        } catch (error) {
            console.error('Error generating problem:', error);
            return null;
        }
    }

    clearRecentProblems() {
        this.recentProblems.clear();
    }

    generateNumbers(grade, operation, rules, difficulty) {
        const { minNum = 1, maxNum } = rules;
        let num1, num2;

        switch (operation) {
            case '+':
            case '-':
                num1 = this.getRandomNumber(minNum, Math.min(rules.maxNum1 || maxNum, 10000));
                num2 = this.getRandomNumber(minNum, Math.min(operation === '-' ? num1 : (rules.maxResult - num1), 10000));
                break;
            case '*':
                num1 = this.getRandomNumber(rules.minFactor, Math.min(rules.maxFactor, 100));
                num2 = this.getRandomNumber(rules.minFactor, Math.min(rules.maxFactor, 100));
                break;
            case '÷':
                if (rules.wholeDivision) {
                    num2 = this.getRandomNumber(2, Math.min(rules.maxDivisor, 20));
                    num1 = num2 * this.getRandomNumber(2, Math.min(10, Math.floor(maxNum / num2)));
                } else {
                    num2 = this.getRandomNumber(2, Math.min(rules.maxDivisor, 20));
                    num1 = num2 * this.getRandomNumber(2, Math.min(10, Math.floor(maxNum / num2)));
                }
                break;
        }

        return [num1, num2];
    }

    getSafeNumbers(grade, operation) {
        switch (operation) {
            case '+':
                return [grade * 10, grade * 5];
            case '-':
                return [grade * 20, grade * 10];
            case '*':
                return [grade * 2, grade];
            case '÷':
                return [grade * 10, grade];
            default:
                return [grade, grade];
        }
    }

    isValidProblem(num1, num2, operation, rules) {
        if (isNaN(num1) || isNaN(num2) || !isFinite(num1) || !isFinite(num2)) {
            return false;
        }

        switch (operation) {
            case '-':
                if (rules.noNegative && num1 < num2) return false;
                break;
            case '+':
                if (rules.maxResult && (num1 + num2) > rules.maxResult) return false;
                if (num1 + num2 > 1000000) return false;
                break;
            case '*':
                if (num1 * num2 > 1000000) return false;
                break;
            case '÷':
                if (num2 === 0) return false;
                if (rules.wholeDivision && num1 % num2 !== 0) return false;
                if (num1 / num2 > 1000000) return false;
                if (num1 % num2 !== 0 && !rules.maxDecimals) return false;
                break;
        }
        return true;
    }

    getRandomNumber(min, max) {
        min = Math.max(1, Math.min(min, 1000000));
        max = Math.max(min, Math.min(max, 1000000));
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    calculateAnswer(num1, num2, operation) {
        try {
            switch (operation) {
                case '+': return num1 + num2;
                case '-': return num1 - num2;
                case '*': return num1 * num2;
                case '÷': 
                    if (num2 === 0) return 0;
                    return Number((num1 / num2).toFixed(2));
                default: throw new Error('Invalid operation');
            }
        } catch (error) {
            console.error('Calculation error:', error);
            return 0;
        }
    }

    getRandomOperation(operations) {
        return operations[Math.floor(Math.random() * operations.length)];
    }
}

module.exports = new ProblemGenerator(); 