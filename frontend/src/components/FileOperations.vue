<template>
  <div class="file-operations">
    <div class="operations-container">
      <div class="operations-group">
        <h3>导入题目</h3>
        <div class="button-group">
          <button class="glass-btn" @click="$refs.wordInput.click()">
            <i class="fas fa-file-word"></i>
            导入Word
          </button>
          <button class="glass-btn" @click="$refs.csvInput.click()">
            <i class="fas fa-file-csv"></i>
            导入CSV
          </button>
        </div>
      </div>

      <div class="operations-group">
        <h3>导出题目</h3>
        <div class="button-group">
          <button class="glass-btn" @click="exportProblems('csv')">
            <i class="fas fa-download"></i>
            导出CSV
          </button>
          <button class="glass-btn" @click="exportProblems('docx')">
            <i class="fas fa-download"></i>
            导出Word
          </button>
        </div>
      </div>

      <div class="operations-group">
        <h3>模板下载</h3>
        <button class="glass-btn template-btn" @click="downloadTemplate">
          <i class="fas fa-file-download"></i>
          下载CSV模板
        </button>
      </div>
    </div>

    <input
      type="file"
      ref="wordInput"
      accept=".docx"
      @change="handleFileSelect"
      style="display: none"
    >
    <input
      type="file"
      ref="csvInput"
      accept=".csv"
      @change="handleFileSelect"
      style="display: none"
    >
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FileOperations',
  methods: {
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/file/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.code === 200 && response.data.data) {
          this.$store.commit('practice/SET_PROBLEMS', response.data.data);
          this.$emit('start-imported-practice');
          alert('导入成功，开始练习');
        }
      } catch (error) {
        console.error('Import error:', error);
        let errorMessage = '导入失败';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage += ': ' + error.response.data.message;
        } else if (error.message) {
          errorMessage += ': ' + error.message;
        }
        alert(errorMessage);
      }
      
      // 清除文件输入，允许重复选择同一文件
      event.target.value = '';
    },

    async exportProblems(format) {
      try {
        const response = await axios.post('/api/file/export', {
          format,
          problems: this.$store.state.practice.problems
        }, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `problems_${Date.now()}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Export error:', error);
        alert('导出失败');
      }
    },

    downloadTemplate() {
      const template = 'NUM1,NUM2,OPERATION,GRADE\n10,5,+,1\n20,10,-,2\n';
      const blob = new Blob([template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }
};
</script>

<style lang="scss" scoped>
.file-operations {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .operations-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .operations-group {
    text-align: center;

    h3 {
      color: #666;
      margin-bottom: 15px;
      font-size: 1.1em;
    }

    .button-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
  }

  .glass-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    box-shadow: 
      0 2px 5px rgba(0,0,0,0.1),
      inset 0 1px 1px rgba(255,255,255,0.6);

    i {
      font-size: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 4px 8px rgba(0,0,0,0.15),
        inset 0 1px 1px rgba(255,255,255,0.6);
      background: rgba(255, 255, 255, 0.8);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 4px rgba(0,0,0,0.1),
        inset 0 1px 1px rgba(255,255,255,0.6);
    }

    &.template-btn {
      background: rgba(76, 175, 80, 0.2);
      color: #2c5530;

      &:hover {
        background: rgba(76, 175, 80, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .file-operations {
    .operations-container {
      grid-template-columns: 1fr;
    }

    .button-group {
      flex-direction: column;
    }
  }
}
</style> 