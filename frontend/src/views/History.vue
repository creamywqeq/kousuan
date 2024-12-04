<template>
  <div class="history">
    <h2>练习历史</h2>
    <div class="history-filters">
      <select v-model="selectedGrade">
        <option value="">所有年级</option>
        <option v-for="grade in grades" :key="grade" :value="grade">
          {{ grade }}年级
        </option>
      </select>
      <div class="date-range">
        <input 
          type="date" 
          v-model="startDate" 
          class="date-input"
          :max="endDate"
        >
        <span>至</span>
        <input 
          type="date" 
          v-model="endDate" 
          class="date-input"
          :min="startDate"
        >
      </div>
    </div>

    <div class="history-list">
      <div v-for="practice in filteredHistory" :key="practice.id" class="history-item">
        <div class="practice-date">{{ formatDate(practice.date) }}</div>
        <div class="practice-details">
          <div>年级：{{ practice.grade }}年级</div>
          <div>得分：{{ practice.score }}分</div>
          <div>正确率：{{ practice.accuracy }}%</div>
          <div>用时：{{ formatTime(practice.totalTime) }}</div>
        </div>
        <button @click="viewDetails(practice)">查看详情</button>
      </div>
    </div>

    <div v-if="selectedPractice" class="practice-details-modal">
      <div class="modal-content">
        <h3>练习详情</h3>
        <div class="practice-info">
          <p>日期：{{ formatDate(selectedPractice.date) }}</p>
          <p>年级：{{ selectedPractice.grade }}年级</p>
          <p>得分：{{ selectedPractice.score }}分</p>
          <p>正确率：{{ selectedPractice.accuracy }}%</p>
          <p>用时：{{ formatTime(selectedPractice.totalTime) }}</p>
        </div>
        <div class="problems-list">
          <div v-for="(problem, index) in selectedPractice.problems" :key="index" class="problem-item">
            <div class="problem-text">{{ problem.text }}</div>
            <div class="answer-info">
              <div>你的答案：{{ problem.userAnswer }}</div>
              <div>正确答案：{{ problem.answer }}</div>
              <div :class="['status', problem.isCorrect ? 'correct' : 'wrong']">
                {{ problem.isCorrect ? '✓ 正确' : '✗ 错误' }}
              </div>
            </div>
          </div>
        </div>
        <button @click="closeDetails" class="close-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .history-filters {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;

    select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
      min-width: 120px;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 10px;

      .date-input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    }
  }

  .history-item {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .practice-date {
      font-weight: bold;
    }

    .practice-details {
      flex-grow: 1;
      margin: 0 20px;
    }
  }
}

.practice-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;

    .practice-info {
      margin: 15px 0;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .problems-list {
      .problem-item {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #eee;
        border-radius: 4px;

        .status {
          &.correct {
            color: #52c41a;
          }
          &.wrong {
            color: #ff4d4f;
          }
        }
      }
    }

    .close-btn {
      margin-top: 20px;
      padding: 8px 16px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  }
}
</style> 

<script>
import axios from 'axios';

export default {
  name: 'History',
  data() {
    return {
      selectedGrade: '',
      startDate: '',
      endDate: '',
      history: [],
      grades: [1, 2, 3, 4, 5, 6],
      selectedPractice: null
    };
  },
  computed: {
    filteredHistory() {
      return this.history;
    }
  },
  methods: {
    async fetchHistory() {
      try {
        const response = await axios.get('/api/practice/history', {
          params: {
            grade: this.selectedGrade,
            startDate: this.startDate,
            endDate: this.endDate
          }
        });
        if (response.data.code === 200) {
          this.history = response.data.data;
        }
      } catch (error) {
        console.error('获取历史记录失败:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    viewDetails(practice) {
      this.selectedPractice = practice;
    },
    closeDetails() {
      this.selectedPractice = null;
    }
  },
  created() {
    this.fetchHistory();
  },
  watch: {
    selectedGrade() {
      this.fetchHistory();
    },
    startDate() {
      this.fetchHistory();
    },
    endDate() {
      this.fetchHistory();
    }
  }
};
</script> 