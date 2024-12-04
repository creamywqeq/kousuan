<template>
  <div class="analysis">
    <div class="analysis-container">
      <h2>练习结果分析</h2>
      
      <div class="chart-container">
        <div class="chart-card">
          <h3>最近练习正确率趋势</h3>
          <v-chart class="chart" :options="accuracyChartOption" :auto-resize="true" />
        </div>

        <div class="chart-card">
          <h3>各年级练习情况</h3>
          <v-chart class="chart" :options="gradeChartOption" :auto-resize="true" />
        </div>
      </div>

      <div class="analysis-actions">
        <button class="glass-btn" @click="exportAnalysis">
          <i class="fas fa-file-export"></i>
          导出分析报告
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import axios from 'axios'

export default {
  name: 'Analysis',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      practiceHistory: [],
      accuracyChartOption: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          name: '正确率(%)'
        },
        series: [{
          data: [],
          type: 'line',
          smooth: true,
          name: '正确率',
          itemStyle: {
            color: '#4CAF50'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(76, 175, 80, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(76, 175, 80, 0.1)'
              }]
            }
          }
        }]
      },
      gradeChartOption: {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          name: '平均正确率(%)'
        },
        series: [{
          data: [],
          type: 'bar',
          name: '平均正确率',
          itemStyle: {
            color: '#1890ff'
          }
        }]
      }
    };
  },
  methods: {
    async fetchAnalysisData() {
      try {
        const response = await axios.get('/api/practice/analysis');
        if (response.data.code === 200) {
          this.practiceHistory = response.data.data;
          this.updateCharts();
        }
      } catch (error) {
        console.error('获取分析数据失败:', error);
      }
    },
    updateCharts() {
      // 更新正确率趋势图
      const recentPractices = this.practiceHistory.slice(-10);
      this.accuracyChartOption = {
        ...this.accuracyChartOption,
        xAxis: {
          ...this.accuracyChartOption.xAxis,
          data: recentPractices.map(p => new Date(p.date).toLocaleDateString())
        },
        series: [{
          ...this.accuracyChartOption.series[0],
          data: recentPractices.map(p => parseFloat(p.accuracy))
        }]
      };

      // 更新年级分析图
      const gradeStats = Array(6).fill(0).map(() => ({ total: 0, count: 0 }));
      this.practiceHistory.forEach(practice => {
        const grade = practice.grade - 1;
        gradeStats[grade].total += parseFloat(practice.accuracy);
        gradeStats[grade].count++;
      });

      this.gradeChartOption = {
        ...this.gradeChartOption,
        series: [{
          ...this.gradeChartOption.series[0],
          data: gradeStats.map(stat => stat.count ? Math.round(stat.total / stat.count) : 0)
        }]
      };
    },
    async exportAnalysis() {
      try {
        const response = await axios.post('/api/practice/export-analysis', {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `practice_analysis_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('导出分析报告失败:', error);
        alert('导出失败');
      }
    }
  },
  mounted() {
    this.fetchAnalysisData();
  }
};
</script>

<style lang="scss" scoped>
.analysis {
  padding: 20px;

  .analysis-container {
    max-width: 1200px;
    margin: 0 auto;

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }

    .chart-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      .chart-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        h3 {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
        }

        .chart {
          height: 400px;
          width: 100%;
        }
      }
    }

    .analysis-actions {
      text-align: center;

      .glass-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        color: #333;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        box-shadow: 
          0 2px 5px rgba(0,0,0,0.1),
          inset 0 1px 1px rgba(255,255,255,0.6);

        i {
          font-size: 18px;
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
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .analysis {
    .chart-container {
      grid-template-columns: 1fr;
    }
  }
}
</style> 