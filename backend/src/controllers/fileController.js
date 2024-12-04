const FileHandler = require('../services/fileHandler');
const path = require('path');

class FileController {
    async importProblems(req, res) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const problems = await FileHandler.importFromFile(req.file);

            if (!problems.length) {
                throw new Error('No valid problems found in file');
            }

            const practice = {
                id: Date.now(),
                problems: problems,
                startTime: new Date(),
                answers: new Array(problems.length).fill(null),
                isCompleted: false
            };

            global.practices.push(practice);

            res.json({
                code: 200,
                data: {
                    id: practice.id,
                    problems: problems
                },
                message: 'Problems imported successfully'
            });
        } catch (error) {
            console.error('Import error:', error);
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }

    async exportProblems(req, res) {
        try {
            const { format, problems } = req.body;
            let filepath;

            if (format === 'csv') {
                filepath = await FileHandler.exportToCsv(problems);
            } else if (format === 'docx') {
                filepath = await FileHandler.exportToWord(problems);
            } else {
                throw new Error('Unsupported export format');
            }

            res.download(filepath, path.basename(filepath), (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // 文件发送后删除
                FileHandler.cleanupExports();
            });
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({
                code: 500,
                message: error.message
            });
        }
    }
}

module.exports = new FileController(); 