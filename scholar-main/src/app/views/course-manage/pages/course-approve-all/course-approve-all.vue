<template>
  <a-layout class='container'>
    <div class='main-header'>
      课程查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课程编号/课程名称/负责人"
               v-model:value="searchWordVal"
               style='width:250px;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <label style='min-width:78px;margin-left: 20px;'>提交时间：</label>
      <a-range-picker v-model:value="dateRangeVal" @change='storingData'/>
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="approveVisible = true" :disabled="!hasSelected">审批
      </a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:880,y: "100%"}'
                 @change='searchList'
                 :row-selection="{ selectedRowKeys: selectedRowKey, onChange: onSelectChange ,getCheckboxProps: getCheckboxProps}"

        >
          <a-table-column key="code"
                          fixed='left'
                          title='课程编号'
                          data-index="code"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          fixed='left'
                          title='课程名称'
                          data-index="name"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column :key='orgCode === "zksd" ? "majorNames" : "majorName"'
                          :title="orgCode === 'zksd' ? '所属专业' : '所属学科'"
                          :data-index='orgCode === "zksd" ? "majorNames" : "majorName"'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="leaderName" title='负责人' data-index="leaderName" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="billDate" title='提交时间' data-index="billDate" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="auditDate" title='审批时间' data-index="auditDate" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="auditStatusName" title='审批状态' data-index="auditStatusName" width='100px'>
            <template #default="{ text ,record}">
                <span :class='{"synopsis-text":true,"red":record.auditStatus==="3","green":record.auditStatus==="2","orange":record.auditStatus==="1"}'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='120px' fixed='right'>
            <template #default="{ record }">
              <span>
                <a-button type='link' @click='preview(record)' style='padding:0;'>预览</a-button>
                <span v-if='record.auditStatus==="1"'>
                    <a-divider type="vertical" style='margin:0 10px'/>
                    <a-button type='link' @click='approved(record)' style='padding:0;color:red;'>审批</a-button>
                </span>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="visible"
             :title="(record.status === '0' ? '课程审批 - ' : '知识图谱审批 - ') + record.name"
             :closable='true'
             :maskClosable='false'
    >
      <div v-if='record.status==="0"'>
        <div>
          课程一经审批通过，课程将开放资源研发存储，课包建设权限。
        </div>
        <div style="margin-bottom: 10px">
          请审批以下内容,审批通过将不影响以后修改。
        </div>
        <div style="margin-bottom: 10px">
          1、课程内容是否完善。
        </div>
        <div>
          2、知识图谱是否已完。
        </div>
      </div>
      <div v-else>
        <div style="margin-bottom: 10px">
          本次将对知识图谱以下内容进行审批
        </div>
        <div style="margin-bottom: 10px">
          1、知识点新增了{{addKnowledgePoints}}个
        </div>
        <div>
          2、知识点删除了{{delKnowledgePoints}}个
        </div>
      </div>
      <template #footer>
        <a-button key="no-pass" :loading="loading" @click="approveAll('3')">不通过</a-button>
        <a-button key="pass" type="primary" :loading="loading" @click="approveAll('2')">通过</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="approveVisible"
             title="批量审批"
             :closable='true'
             :maskClosable='false'
    >
      课程一经审批通过，课程将开放资源研发存储，课包建设权限。
      <br/> 请审批以下内容；审批通过将不影响以后修改。
      <br/> 1、课程信息是否完善
      <br/> 2、知识图谱是否已完善
      <br/> <br/> 确定审批选中的{{selectedRowKey.length}}项？
      <template #footer>
        <a-button key="no-pass" :loading="loading" @click="approvBatch('AUDIT_REJECT')">不通过</a-button>
        <a-button key="pass" type="primary" :loading="loading" @click="approvBatch('AUDIT_PASS')">通过</a-button>
      </template>
    </a-modal>

  </a-layout>
</template>
<script lang="ts">
import CourseApproveAll from './course-approve-all'
export default CourseApproveAll
</script>
<style lang="less" scoped>
 @import './course-approve-all';
</style>
