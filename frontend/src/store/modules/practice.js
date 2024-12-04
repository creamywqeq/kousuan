import axios from 'axios'

const state = {
  problems: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  accuracy: 0,
  totalTime: 0,
  practiceId: null
}

const mutations = {
  SET_PROBLEMS(state, payload) {
    const problems = payload.problems || payload;
    state.problems = Array.isArray(problems) ? problems.map(p => ({
      ...p,
      id: p.id || Date.now() + Math.random()
    })) : [];
    state.answers = new Array(state.problems.length).fill(null);
    state.currentIndex = 0;
    if (payload.id) {
      state.practiceId = payload.id;
    }
  },
  SET_ANSWER(state, { index, answer, isCorrect }) {
    state.answers[index] = { value: answer, isCorrect }
    if (index < state.problems.length - 1) {
      state.currentIndex++
    }
  },
  SET_PRACTICE_RESULTS(state, { score, accuracy, totalTime }) {
    state.score = score
    state.accuracy = accuracy
    state.totalTime = totalTime
  },
  RESET_PRACTICE(state) {
    state.problems = []
    state.currentIndex = 0
    state.answers = []
    state.score = 0
    state.accuracy = 0
    state.totalTime = 0
    state.practiceId = null
  }
}

const actions = {
  async generateProblems({ commit }, { grade, count }) {
    try {
      const response = await axios.post('/api/practice/start', 
        { grade, count },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.code === 200 && response.data.data && response.data.data.problems) {
        commit('SET_PROBLEMS', response.data.data.problems);
        state.practiceId = response.data.data.id;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('生成题目失败:', error);
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
      }
      throw error;
    }
  },

  async submitAnswer({ commit, state }, answer) {
    try {
      const response = await axios.post('/api/practice/submit', {
        practiceId: state.practiceId,
        problemIndex: state.currentIndex,
        answer: parseFloat(answer)
      });

      if (response.data.code === 200) {
        commit('SET_ANSWER', {
          index: state.currentIndex,
          answer: parseFloat(answer),
          isCorrect: response.data.data.isCorrect
        });
      }
      return response.data;
    } catch (error) {
      console.error('提交答案失败:', error);
      throw error;
    }
  },

  async finishPractice({ commit, state }) {
    try {
      const response = await axios.post('/api/practice/finish', {
        practiceId: state.practiceId
      })
      if (response.data.code === 200) {
        commit('SET_PRACTICE_RESULTS', response.data.data)
      }
    } catch (error) {
      console.error('完成练习失败:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 