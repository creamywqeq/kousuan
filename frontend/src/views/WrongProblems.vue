<template>
  <div class="wrong-problems">
    <h2>错题集</h2>
    <div class="filters">
      <select v-model="selectedGrade">
        <option value="">所有年级</option>
        <option v-for="grade in grades" :key="grade" :value="grade">
          {{ grade }}年级
        </option>
      </select>
      <select v-model="selectedOperation">
        <option value="">所有运算</option>
        <option value="+">加法</option>
        <option value="-">减法</option>
        <option value="*">乘法</option>
        <option value="÷">除法</option>
      </select>
    </div>

    <div class="problems-list">
      <div v-if="wrongProblems.length === 0" class="no-problems">
        暂无错题记录
      </div>
      <div v-else v-for="problem in filteredProblems" :key="problem.id" class="problem-item">
        <div class="problem-text">{{ problem.problem.text }}</div>
        <div class="wrong-info">
          <div>错误答案：{{ problem.wrongAnswer }}</div>
          <div v-if="problem.mastered">正确答案：{{ problem.problem.answer }}</div>
          <div>错误次数：{{ problem.wrongCount }}</div>
          <div>最近错误：{{ formatDate(problem.lastWrongDate) }}</div>
        </div>
        <button @click="practiceProblem(problem)" :class="{ mastered: problem.mastered }">
          {{ problem.mastered ? '已掌握' : '练习' }}
        </button>
      </div>
    </div>

    <div v-if="practicing" class="practice-modal">
      <div class="modal-content">
        <h3>练习题目</h3>
        <div class="problem-text">{{ currentProblem.problem.text }}</div>
        <input type="number" v-model="userAnswer" @keyup.enter="submitAnswer">
        <div class="button-group">
          <button @click="submitAnswer">提交</button>
          <button @click="closePractice">关闭</button>
        </div>
        <div v-if="practiceResult" :class="['result', practiceResult.isCorrect ? 'correct' : 'wrong']">
          {{ practiceResult.isCorrect ? '回答正确！' : '回答错误，正确答案是：' + currentProblem.problem.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WrongProblems',
  data() {
    return {
      selectedGrade: '',
      selectedOperation: '',
      wrongProblems: [],
      grades: [1, 2, 3, 4, 5, 6],
      practicing: false,
      currentProblem: null,
      userAnswer: '',
      practiceResult: null
    };
  },
  computed: {
    filteredProblems() {
      let problems = [...this.wrongProblems];
      
      if (this.selectedGrade) {
        problems = problems.filter(p => p.problem.grade === parseInt(this.selectedGrade));
      }
      
      if (this.selectedOperation) {
        problems = problems.filter(p => p.problem.operation === this.selectedOperation);
      }
      
      return problems.sort((a, b) => new Date(b.lastWrongDate) - new Date(a.lastWrongDate));
    }
  },
  methods: {
    async fetchWrongProblems() {
      try {
        const response = await axios.get('/api/practice/wrong-problems');
        if (response.data.code === 200) {
          this.wrongProblems = response.data.data;
        }
      } catch (error) {
        console.error('获取错题失败:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    practiceProblem(problem) {
      this.currentProblem = problem;
      this.practicing = true;
      this.userAnswer = '';
      this.practiceResult = null;
    },
    async submitAnswer() {
      if (!this.userAnswer) return;
      
      const isCorrect = Math.abs(this.currentProblem.problem.answer - parseFloat(this.userAnswer)) < 0.0001;
      this.practiceResult = { isCorrect };
      
      if (isCorrect) {
        try {
          // 调用后端API删除已掌握的错题
          await axios.post('/api/practice/remove-wrong-problem', {
            problemId: this.currentProblem.id
          });
          // 从列表中移除
          this.wrongProblems = this.wrongProblems.filter(p => p.id !== this.currentProblem.id);
          setTimeout(() => {
            this.closePractice();
          }, 1500); // 1.5秒后关闭弹窗
        } catch (error) {
          console.error('更新错题状态失败:', error);
        }
      }
    },
    closePractice() {
      this.practicing = false;
      this.currentProblem = null;
      this.userAnswer = '';
      this.practiceResult = null;
    }
  },
  created() {
    this.fetchWrongProblems();
  },
  watch: {
    selectedGrade() {
      this.fetchWrongProblems();
    },
    selectedOperation() {
      this.fetchWrongProblems();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrong-problems {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
  }

  .problem-item {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .problem-text {
      font-size: 20px;
      font-weight: bold;
      min-width: 150px;
    }

    .wrong-info {
      flex-grow: 1;
      margin: 0 20px;
      
      div {
        margin: 5px 0;
        &.answer {
          color: #52c41a;
          font-weight: bold;
        }
      }
    }

    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background: #1890ff;
      color: white;
      cursor: pointer;

      &.mastered {
        background: #52c41a;
      }
    }
  }

  .practice-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;

    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
      text-align: center;

      .problem-text {
        font-size: 24px;
        margin: 20px 0;
      }

      input {
        font-size: 20px;
        padding: 8px;
        width: 100px;
        text-align: center;
        margin: 10px 0;
      }

      .button-group {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      .result {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;

        &.correct {
          background: #f6ffed;
          color: #52c41a;
        }

        &.wrong {
          background: #fff2f0;
          color: #ff4d4f;
        }
      }
    }
  }

  .no-problems {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
  }
}
</style> 