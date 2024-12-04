<template>
  <div class="practice">
    <div class="practice-container">
      <!-- 标题和文件操作区域 -->
      <div class="header-section">
        <h1>口算练习系统</h1>
        <FileOperations 
          @problems-imported="handleImportedProblems"
          @start-imported-practice="startImportedPractice"
        />
      </div>

      <!-- 练习设置区域 -->
      <div class="practice-content" :class="{ 'started': isStarted }">
        <div class="practice-header">
          <div class="timer" v-if="isStarted">
            <i class="fas fa-clock"></i>
            {{ formatTime(remainingTime) }}
          </div>
        </div>

        <div class="practice-settings" v-if="!isStarted">
          <div class="settings-card">
            <h3>练习设置</h3>
            <div class="settings-group">
              <div class="setting-item">
                <label>年级</label>
                <select v-model="selectedGrade">
                  <option v-for="grade in grades" :key="grade" :value="grade">
                    {{ grade }}年级
                  </option>
                </select>
              </div>
              <div class="setting-item">
                <label>题目数量</label>
                <select v-model="problemCount">
                  <option v-for="count in counts" :key="count" :value="count">
                    {{ count }}题
                  </option>
                </select>
              </div>
            </div>
            <button @click="startPractice" class="start-btn">开始练习</button>
          </div>
        </div>

        <!-- 练习区域 -->
        <div class="problem-section" v-else-if="!isCompleted">
          <div class="problem-card">
            <div class="problem-header">
              <span class="progress">第 {{ currentIndex + 1 }} / {{ problems.length }} 题</span>
            </div>
            <div class="problem-content">
              <div class="problem">{{ currentProblem.text }}</div>
              <div class="answer-input">
                <input
                  type="number"
                  v-model="userAnswer"
                  @keyup.enter="handleSubmitAnswer"
                  ref="answerInput"
                  :disabled="isCompleted"
                  placeholder="请输入答案"
                />
                <button 
                  @click="handleSubmitAnswer" 
                  :disabled="!userAnswer"
                  class="submit-btn"
                >
                  提交答案
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果展示区域 -->
        <div class="results-section" v-if="isCompleted">
          <div class="results-card">
            <h3>练习结果</h3>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-label">得分</div>
                <div class="stat-value">{{ score }}分</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">用时</div>
                <div class="stat-value">{{ formatTime(totalTime) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">正确率</div>
                <div class="stat-value">{{ accuracy }}%</div>
              </div>
            </div>
            <button @click="resetPractice" class="reset-btn">重新开始</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import FileOperations from '../components/FileOperations.vue';

export default {
  name: 'Practice',
  components: {
    FileOperations
  },
  data() {
    return {
      selectedGrade: 1,
      problemCount: 10,
      userAnswer: '',
      isStarted: false,
      isCompleted: false,
      remainingTime: 0,
      timer: null,
      grades: [1, 2, 3, 4, 5, 6],
      counts: [5, 10, 15, 20]
    }
  },
  computed: {
    ...mapState({
      problems: state => state.practice.problems,
      currentIndex: state => state.practice.currentIndex,
      score: state => state.practice.score,
      accuracy: state => state.practice.accuracy,
      totalTime: state => state.practice.totalTime
    }),
    currentProblem() {
      return this.problems[this.currentIndex] || {}
    }
  },
  methods: {
    ...mapActions('practice', [
      'generateProblems',
      'submitAnswer',
      'finishPractice'
    ]),
    async startPractice() {
      try {
        console.log('Starting practice...', this.selectedGrade, this.problemCount)
        await this.generateProblems({
          grade: this.selectedGrade,
          count: this.problemCount
        })
        this.isStarted = true
        this.startTimer()
        this.$nextTick(() => {
          if (this.$refs.answerInput) {
            this.$refs.answerInput.focus()
          }
        })
      } catch (error) {
        console.error('Failed to start practice:', error)
      }
    },
    async handleSubmitAnswer() {
      if (!this.userAnswer) return

      try {
        await this.submitAnswer(this.userAnswer)
        this.userAnswer = ''

        if (this.currentIndex === this.problems.length - 1) {
          await this.finishPractice()
          this.isCompleted = true
          clearInterval(this.timer)
        }

        this.$nextTick(() => {
          if (this.$refs.answerInput) {
            this.$refs.answerInput.focus()
          }
        })
      } catch (error) {
        console.error('Failed to submit answer:', error)
      }
    },
    startTimer() {
      this.remainingTime = this.problemCount * 60 // 每题1分钟
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
        } else {
          this.finishPractice()
          this.isCompleted = true
          clearInterval(this.timer)
        }
      }, 1000)
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    resetPractice() {
      this.isStarted = false
      this.isCompleted = false
      this.userAnswer = ''
      clearInterval(this.timer)
      this.$store.commit('practice/RESET_PRACTICE')
    },
    handleImportedProblems(problems) {
      this.$store.commit('practice/SET_PROBLEMS', problems);
    },
    startImportedPractice() {
      this.isStarted = true;
      this.startTimer();
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.practice {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;

  .practice-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .header-section {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      color: #1890ff;
      font-size: 2.5em;
      margin-bottom: 20px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
  }

  .practice-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    padding: 30px;
    min-height: 400px;

    &.started {
      background: #f8f9fa;
    }
  }

  .practice-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;

    .timer {
      font-size: 24px;
      font-weight: bold;
      color: #1890ff;
      padding: 8px 16px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      i {
        margin-right: 8px;
      }
    }
  }

  .settings-card {
    background: white;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    h3 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5em;
    }

    .settings-group {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 30px;

      .setting-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        label {
          font-size: 16px;
          color: #666;
        }

        select {
          padding: 8px 16px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 120px;
          background: white;
          cursor: pointer;

          &:focus {
            border-color: #1890ff;
            outline: none;
          }
        }
      }
    }
  }

  .problem-card {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    .problem-header {
      text-align: center;
      margin-bottom: 20px;

      .progress {
        font-size: 18px;
        color: #666;
        background: #f5f5f5;
        padding: 4px 12px;
        border-radius: 16px;
      }
    }

    .problem-content {
      text-align: center;

      .problem {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 30px;
        color: #333;
      }

      .answer-input {
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: center;

        input {
          width: 150px;
          font-size: 24px;
          padding: 12px;
          text-align: center;
          border: 2px solid #ddd;
          border-radius: 4px;

          &:focus {
            border-color: #1890ff;
            outline: none;
          }
        }
      }
    }
  }

  .results-card {
    background: white;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    h3 {
      color: #333;
      margin-bottom: 30px;
      font-size: 1.5em;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1890ff;
        }
      }
    }
  }

  button {
    padding: 12px 24px;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &.start-btn {
      background: #1890ff;
      color: white;

      &:hover {
        background: #40a9ff;
        transform: translateY(-2px);
      }
    }

    &.submit-btn {
      background: #52c41a;
      color: white;

      &:hover {
        background: #73d13d;
      }

      &:disabled {
        background: #d9d9d9;
        cursor: not-allowed;
      }
    }

    &.reset-btn {
      background: #1890ff;
      color: white;

      &:hover {
        background: #40a9ff;
        transform: translateY(-2px);
      }
    }
  }
}
</style> 