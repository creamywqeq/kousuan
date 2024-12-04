const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType } = require('docx');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

class FileHandler {
    constructor() {
        // 创建上传目录
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.exportDir = path.join(__dirname, '../../exports');
        
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir, { recursive: true });
        }
    }

    async importFromFile(file) {
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        if (fileExt === '.csv') {
            return await this.importFromCsv(file);
        } else if (fileExt === '.docx') {
            return await this.importFromWord(file);
        } else {
            throw new Error('Unsupported file format');
        }
    }

    async importFromCsv(file) {
        const problems = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (row) => {
                    try {
                        // 统一操作符
                        let operation = row.OPERATION || row.operation;
                        operation = operation
                            .replace('×', '*')
                            .replace('/', '÷');

                        const num1 = parseInt(row.NUM1 || row.num1);
                        const num2 = parseInt(row.NUM2 || row.num2);
                        const grade = parseInt(row.GRADE || row.grade);

                        if (isNaN(num1) || isNaN(num2) || isNaN(grade)) {
                            console.warn('Invalid numbers in CSV:', row);
                            return;
                        }

                        const answer = this.calculateAnswer(num1, num2, operation);
                        const problem = {
                            id: Date.now() + problems.length,
                            num1,
                            num2,
                            operation,
                            answer,
                            grade,
                            text: `${num1} ${operation} ${num2} = ?`,
                            difficulty: 'medium'
                        };

                        if (this.isValidProblem(problem)) {
                            problems.push(problem);
                        }
                    } catch (err) {
                        console.warn('Error processing CSV row:', err);
                    }
                })
                .on('end', () => {
                    fs.unlinkSync(file.path);
                    if (problems.length === 0) {
                        reject(new Error('No valid problems found in CSV file'));
                    } else {
                        resolve(problems);
                    }
                })
                .on('error', reject);
        });
    }

    async importFromWord(file) {
        try {
            const result = await mammoth.extractRawText({ path: file.path });
            const text = result.value;
            const problems = [];

            // 更新正则表达式以匹配更多格式
            const problemRegex = /(\d+)\s*([\+\-\*×÷])\s*(\d+)\s*=\s*(\?|_+)/g;
            let match;

            while ((match = problemRegex.exec(text)) !== null) {
                try {
                    const num1 = parseInt(match[1]);
                    let operation = match[2];
                    // 统一操作符
                    operation = operation
                        .replace('×', '*')
                        .replace('/', '÷');
                    const num2 = parseInt(match[3]);

                    // 验证数字
                    if (isNaN(num1) || isNaN(num2)) {
                        console.warn('Invalid numbers:', match[1], match[3]);
                        continue;
                    }

                    const answer = this.calculateAnswer(num1, num2, operation);
                    const grade = this.determineGrade(num1, num2, operation);

                    const problem = {
                        id: Date.now() + problems.length, // 添加唯一ID
                        num1,
                        num2,
                        operation,
                        answer,
                        grade,
                        text: `${num1} ${operation} ${num2} = ?`,
                        difficulty: 'medium'
                    };

                    if (this.isValidProblem(problem)) {
                        problems.push(problem);
                    }
                } catch (err) {
                    console.warn('Error processing problem:', err);
                    continue;
                }
            }

            fs.unlinkSync(file.path);
            
            if (problems.length === 0) {
                throw new Error('No valid problems found in the document');
            }

            return problems;
        } catch (error) {
            console.error('Error importing Word document:', error);
            throw error;
        }
    }

    isValidProblem(problem) {
        return (
            !isNaN(problem.num1) &&
            !isNaN(problem.num2) &&
            !isNaN(problem.answer) &&
            ['+', '-', '*', '÷'].includes(problem.operation) &&
            problem.grade >= 1 &&
            problem.grade <= 6
        );
    }

    calculateAnswer(num1, num2, operation) {
        try {
            switch (operation) {
                case '+': return num1 + num2;
                case '-': return num1 - num2;
                case '*': return num1 * num2;
                case '÷':
                    if (num2 === 0) throw new Error('Division by zero');
                    return Number((num1 / num2).toFixed(2));
                default:
                    throw new Error(`Invalid operation: ${operation}`);
            }
        } catch (error) {
            console.error('Calculation error:', error);
            throw error;
        }
    }

    determineGrade(num1, num2, operation) {
        const max = Math.max(num1, num2);
        if (max <= 20) return 1;
        if (max <= 100) return 2;
        if (max <= 1000) return 3;
        if (max <= 10000) return 4;
        if (max <= 100000) return 5;
        return 6;
    }

    async exportToCsv(problems) {
        const filename = `problems_${Date.now()}.csv`;
        const filepath = path.join(this.exportDir, filename);

        const csvWriter = createCsvWriter({
            path: filepath,
            header: [
                { id: 'num1', title: 'NUM1' },
                { id: 'num2', title: 'NUM2' },
                { id: 'operation', title: 'OPERATION' },
                { id: 'answer', title: 'ANSWER' },
                { id: 'grade', title: 'GRADE' },
                { id: 'difficulty', title: 'DIFFICULTY' }
            ]
        });

        await csvWriter.writeRecords(problems);
        return filepath;
    }

    async exportToWord(problems) {
        const filename = `problems_${Date.now()}.docx`;
        const filepath = path.join(this.exportDir, filename);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '口算练习题',
                                bold: true,
                                size: 32
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    this.createProblemsTable(problems)
                ]
            }]
        });

        // 使用 Packer 来生成文档
        const buffer = await require('docx').Packer.toBuffer(doc);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }

    createProblemsTable(problems) {
        const rows = [];
        
        // 添加表头
        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: '题目', bold: true })],
                            alignment: AlignmentType.CENTER
                        })],
                        width: {
                            size: 25,
                            type: WidthType.PERCENTAGE
                        }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: '答案', bold: true })],
                            alignment: AlignmentType.CENTER
                        })],
                        width: {
                            size: 25,
                            type: WidthType.PERCENTAGE
                        }
                    })
                ]
            })
        );

        // 添加题目
        problems.forEach(problem => {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun(problem.text)],
                                alignment: AlignmentType.CENTER
                            })],
                            width: {
                                size: 25,
                                type: WidthType.PERCENTAGE
                            }
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun('_______')],
                                alignment: AlignmentType.CENTER
                            })],
                            width: {
                                size: 25,
                                type: WidthType.PERCENTAGE
                            }
                        })
                    ]
                })
            );
        });

        return new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            rows: rows,
            columnWidths: [3000, 3000],
            margins: {
                top: 100,
                bottom: 100,
                right: 100,
                left: 100
            }
        });
    }

    cleanupExports() {
        // 清理超过1小时的导出文件
        const files = fs.readdirSync(this.exportDir);
        const oneHourAgo = Date.now() - 3600000;

        files.forEach(file => {
            const filepath = path.join(this.exportDir, file);
            const stats = fs.statSync(filepath);
            if (stats.ctimeMs < oneHourAgo) {
                fs.unlinkSync(filepath);
            }
        });
    }
}

module.exports = new FileHandler(); 