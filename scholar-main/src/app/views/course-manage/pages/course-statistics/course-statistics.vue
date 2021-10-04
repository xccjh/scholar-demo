<template>
  <a-layout class='container'>
    <div class='main-header'>
      数据统计
      <a-button class="back-btn" @click="goback()">返回</a-button>
    </div>
    <div class='header'>
      <div class='header-container'>
        <div class='header-item'>
          <div class='num'>{{knowledgePoints}}</div>
          <div class='text'>知识点数</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{numberOfExercises}}</div>
          <div class='text'>习题数</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{moreEasy}}</div>
          <div class='text'>较易</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{easy}}</div>
          <div class='text'>易</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{medium}}</div>
          <div class='text'>中</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{difficult}}</div>
          <div class='text'>难</div>
        </div>
        <div class='header-item'>
          <div class='num'>{{moreDifficult}}</div>
          <div class='text'>较难</div>
        </div>
      </div>
    </div>
    <a-layout-content style="padding: 15px 20px 20px; flex:1;" class="content">
      <div class="course-header">
        <div class='header-item fl2'>
          <label class='header-label'>关键词搜索: </label>
          <div class='input-container'>
            <a-input placeholder="支持知识点编码/知识点名称"
                     v-model:value="searchWordVal"
                     style='width:250px;margin-right: 20px;'
                     @pressEnter='searchData("button")'
                     @change="storingData"
            />
          </div>
        </div>
        <div class='header-item ml40 fl1'>
          <label class='header-label'>习题数量: </label>
          <div class='input-container'>
            <a-select
              v-model:value="selectedVal"
              @change="storingData"
              allowClear
              style='margin-right: 20px;width:100%;text-align:left'
              placeholder="请选择习题数量"
            >
              <a-select-option value="全部">全部</a-select-option>
              <a-select-option value="<3">&lt;3</a-select-option>
              <a-select-option value="≥3">≥3</a-select-option>
            </a-select>
          </div>
        </div>
        <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
        <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
        <a-button type="primary" style='margin-left:20px;' @click="exportStatistics" :loading='exportLoading'>导出</a-button>
      </div>
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:1050,y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="knowledgePointCode"
                          title='知识点编码'
                          data-index="knowledgePointCode"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="knowledgePointName"
                          title='知识点名称'
                          data-index="knowledgePointName"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="questionNum" title='习题数' data-index="questionNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="moreEasyNum" title='较易' data-index="moreEasyNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="easyNum" title='易' data-index="easyNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="middleNum" title='中' data-index="middleNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="hardNum" title='难' data-index="hardNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="moreHardNum" title='较难' data-index="moreHardNum" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="fileType1" title='讲解视频' data-index="fileType1" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>
  </a-layout>
</template>
<script lang="ts">
import CourseStatistics from './course-statistics'
export default CourseStatistics
</script>
<style lang="less" scoped>
@import './course-statistics';
</style>
