<template>
  <a-layout class='container'>
    <div class='main-header'>
      课包查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课包编号/课包名称"
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
                 :scroll='{x:1430,y: "100%"}'
                 @change='searchList'
                 :row-selection="{ selectedRowKeys: selectedRowKey, onChange: onSelectChange ,  getCheckboxProps: getCheckboxProps}"
        >
          <a-table-column key="pcode"
                          fixed='left'
                          title='课包编号'
                          data-index="pcode"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          title='课包名称'
                          fixed='left'
                          data-index="name"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="courseName"
                          title='所属课程'
                          data-index="courseName"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key='majorName'
                          :title="orgCode === 'zksd' ? '所属专业' : '所属学科'"
                          data-index='majorName'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="nickName" title='提交人' data-index="nickName" width='120px'>
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

          <a-table-column key="auditStatus" title='审批状态' data-index="auditStatus" width='120px'>
            <template #default="{ text }">
                <span :class='{"synopsis-text":true,"red":text==="3","green":text==="2","orange":text==="1"}'>
                  {{ getAuditStatusPkg(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='150px' fixed='right'>
            <template #default="{ record }">
              <span v-if='delIf(record)'>
                <a-button type='link' @click='preview(record)' style='padding:0;'>预览</a-button>
                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button type='link' @click='share(record)' style='padding:0;'>分享</a-button>
              </span>
              <span v-if='record.auditStatus==="1"'>
                    <a-divider type="vertical" style='margin:0 10px'/>
                    <a-button type='link' @click='approved(record)' style='padding:0;color:red;'>审批</a-button>
                </span>
              <span v-if="!(delIf(record)||record.auditStatus==='1')">--</span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="visible"
             title="提交审批"
             :closable='true'
             :maskClosable='false'
    >
     <span>
      课包审批通过后，可进入教务排课与网校销售阶段。
    </span>
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
      课包审批通过后，可进入教务排课与网校销售阶段。
      <br/> <br/> 确定审批选中的 {{selectedRowKey.length}}项？
      <template #footer>
        <a-button key="no-pass" :loading="loading" @click="approvBatch(3)">不通过</a-button>
        <a-button key="pass" type="primary" :loading="loading" @click="approvBatch(2)">通过</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="shareVisible"
             title="课包效果分享"
             :closable='true'
             :footer='null'
             :maskClosable='false'
    >
      <div class='share-line'>
        <label style='margin:0 10px 0 12px;display:inline-block;width:56px'>链接：</label>
        <a-input v-model:value="shareLink" placeholder="请输入链接" style="max-width:304px"/>
        <span style="margin-left: 10px;">15天后失效</span>
      </div>
      <div class='share-line'>
        <label style='margin:0 10px 0 12px;display:inline-block;width:56px'>验证码：</label>
        <a-input v-model:value="verificationCode" placeholder="请输入验证码"  style="max-width:100px"/>
        <a-button type='primary' style='margin-left: 40px;' @click="refreshCode()">刷新</a-button>
      </div>
      <div class='share-button'>
        <a-button @click="closeShareModal()" style='margin-right:20px'>取消</a-button>
        <a-button type="primary" @click="copyLinkAndVerificationCode()">复制链接及验证码</a-button>
      </div>
    </a-modal>

  </a-layout>
</template>
<script lang="ts">
import PkgApproveAll from './pkg-approve-all'
export default PkgApproveAll
</script>
<style lang="less" scoped>
@import './pkg-approve-all';
</style>
