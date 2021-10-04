<template>
  <a-layout class='container'>
    <div class='main-header'>
      课包查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课包编号/课包名称"
               v-model:value="searchWordVal"
               style='width:25%;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <label style='min-width:78px;margin-left: 20px;'>所属课程：</label>
      <a-select
        v-model:value="selectedVal"
        @change="storingData"
        :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
        class='common-select'
        placeholder="请选择所属课程"
        showSearch
        allowClear
      >
        <a-select-option :value="course.id" v-for='course in courseList' :key='course.id'>{{course.name}}
        </a-select-option>
      </a-select>
      <label style='min-width:78px;margin-left: 20px;'>更新时间：</label>
      <a-range-picker v-model:value="dateRangeVal" @change='storingData'/>
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class="body-header">

        <a-button type="primary"
                  @click="startEdit()"
                  style="margin-bottom:20px;margin-right:20px;"
        >新增课包
        </a-button>
        <a-button type="primary"
                  @click="enterSeriesManagement()"
                  style="margin-bottom:20px;margin-right:20px;"
        >系列管理
        </a-button>

        <a-tooltip>
          <template #title>请选择要批量售卖的课包</template>
          <a-dropdown :disabled='!hasSelected'>
            <template #overlay>
              <a-menu @click="batchSale">
                <a-menu-item key='1'>
                  售卖
                </a-menu-item>
                <a-menu-item key='0'>
                  取消售卖
                </a-menu-item>
              </a-menu>
            </template>
            <a-button type="primary"
                      style="margin-bottom:20px;margin-right:20px;"
            >售卖
              <DownOutlined/>
            </a-button>
          </a-dropdown>
        </a-tooltip>

        <a-dropdown :disabled='!hasSelected'>
          <template #overlay>
            <a-menu @click="batchUse">
              <a-menu-item key='1'>
                启用
              </a-menu-item>
              <a-menu-item key='0'>
                取消启用
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="primary"
                    style="margin-bottom:20px;margin-right:20px;"
          >启用
            <DownOutlined/>
          </a-button>
        </a-dropdown>
        <div style='float:right'>
          <span class='text-vertical'>自定义列</span>
          <a-dropdown trigger='click' v-model:visible='customColumnVisible'>
            <template #overlay>
              <div class='checkbox-container' @click='customColumnVisibleCheckBoxClick()'>
                <a-checkbox-group v-model:value="customColumnValue" style='margin-right: 20px;'
                                  @change='customColumnValueChange'>
                  <div v-for='item in customColumn' :key='item'>
                    <a-checkbox :value="item">{{item}}</a-checkbox>
                  </div>
                </a-checkbox-group>
              </div>
            </template>
            <UnorderedListOutlined class='more-vertical'/>
          </a-dropdown>
        </div>
      </div>
      <div class='table-container fix-table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:1690,y: "100%"}'
                 @change='searchList'
                 :row-selection="{ selectedRowKeys: selectedRowKey, onChange: onSelectChange }"
        >
          <a-table-column key="pcode"
                          title='课包编号'
                          v-if='showColumn("课包编号")'
                          data-index="pcode"
                          fixed='left'
                          width='140px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          title='课包名称'
                          v-if='showColumn("课包名称")'
                          data-index="name"
                          fixed='left'
                          width='160px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="courseId"
                          title='所属课程'
                          v-if='showColumn("所属课程")'
                          data-index="courseId"
                          width='160px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ courseMapId[text] || '--'}}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="courseSubjectTypeId"
                          title='课程科目类型'
                          v-if='showColumn("课程科目类型")'
                          data-index="courseSubjectTypeId"
                          width='110px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ courseSubjectTypeMap[text] || '--' }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="courseSeriesName"
                          title='系列名称'
                          v-if='showColumn("系列名称")'
                          data-index="courseSeriesName"
                          width='150px'
                          :sortOrder='courseSeriesNameSortOrder'
                          :sorter='true'
          >
            <template #default="{text,record}">
                <span class='synopsis-text'>
                  {{ text? (text + (record.packetVer ? '-' + record.packetVer : '')):'--'}}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="teachType"
                          title='类型'
                          v-if='showColumn("类型")'
                          data-index="teachType"
                          width='100px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getTeacheType(text) }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="packetTags"
                          title='课包标签'
                          v-if='showColumn("课包标签")'
                          data-index="packetTags"
                          width='150px'>
            <template #default="{ text }">
              <span :class="{
                  'packet-tags-desc':text,
                  'jd':text && text.split('-')[1]==='1',
                  'kq': text && text.split('-')[1]==='2'
                  }">
              {{getPacketTagsDesc(text ? text.split('-')[1] : '')}}
              </span>
            </template>
          </a-table-column>

          <a-table-column key="isSmart"
                          title='智适应'
                          data-index="isSmart"
                          width='60px'
                          v-if='showColumn("智适应")'
          >
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text === '1' ? '是' : '否' }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="isSale"
                          title='售卖'
                          data-index="isSale"
                          width='60px'
                          v-if='showColumn("售卖")'
          >
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text === '1' ? '是' : '否' }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="isUsed"
                          title='启用'
                          data-index="isUsed"
                          width='90px'
                          v-if='showColumn("启用")'
          >
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text === '1' ? '是' : '否' }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="updateName"
                          title='更新人'
                          data-index="updateName"
                          width='100px'
                          v-if='showColumn("更新人")'
          >
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="lastModifiedTime"
                          title='更新时间'
                          ata-index="lastModifiedTime"
                          width='120px'
                          v-if='showColumn("更新时间")'
          >
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="auditStatus"
                          title='状态'
                          data-index="auditStatus"
                          width='80px'
                          v-if='showColumn("状态")'
          >
            <template #default="{ text }">
              <span :class='{"synopsis-text":true,"red":text==="3","green":text==="2","orange":text==="1"}'>
                  {{ getAuditStatus(text) }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="action"
                          title="操作"
                          width='230px'
                          fixed='right'
                          v-if='showColumn("操作")'
          >
            <template #default="{ record }">
              <span v-if='initButton(record)'>
                <span v-for='(item , i) in record?.upButtonArr'
                      :key='i'>
                  <a-button type='link'
                            @click="methodChange(record,i,'upButtonArr')"
                            style='padding:0;'
                            v-if='item.method!=="delPacketAction"'
                            :class="{'light-color':item.method==='del'}">{{getButtonTitle(item,record)}}</a-button>
                   <a-tooltip placement="bottom" :title='getDelCompetence(record)'>
                      <template #title>
                        {{ delIf(record) ? getDelCompetence(record):''}}
                       </template>
                       <a-button type='link'
                                 @click="methodChange(record,i,'upButtonArr')"
                                 style='padding:0;'
                                 v-if='item.method === "delPacketAction"'
                                 :class="{'light-color':delIf(record),'gray-color':!delIf(record)}">{{getButtonTitle(item,record)}}</a-button>
                   </a-tooltip>
                  <a-divider type="vertical" style='margin:0 5px' v-if='i!==record?.upButtonArr.length-1'/>
                </span>
                  <a-tooltip placement="bottom" overlayClassName='more-operate'>
                    <template #title>
                      <span v-for='(button , i) in record?.dropButtonArr'
                            :key='i'>
                         <a-button
                           type='link'
                           :class="{'light-color':button.method==='del'}"
                           @click="methodChange(record,i,'dropButtonArr')"
                           style='display:block;'
                           v-if='button.method!=="delPacketAction"'
                         >{{getButtonTitle(button,record)}}
                        </a-button>
                         <a-tooltip placement="bottom" v-else :title='getDelCompetence(record)'>
                           <a-button type='link'
                                     @click="methodChange(record,i,'dropButtonArr')"
                                     style='display:block;'
                                     v-if='button.method==="delPacketAction"'
                                     :class="{'light-color':delIf(record),'gray-color':!delIf(record)}">{{getButtonTitle(button,record)}}</a-button>
                         </a-tooltip>
                      </span>
                    </template>
                    <span v-if='record?.dropButtonArr?.length'>
                       <a-divider type="vertical" style='margin:0 5px'/>
                        <a-button type='link'
                                  style='padding:0;transform:rotateZ(90deg) scale(2) translateY(-4px)'
                        ><MoreOutlined/></a-button>
                    </span>
                  </a-tooltip>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="visible"
             :title="`${isEdit ? '编辑课包' : '新增空白课包'}`"
             @ok="confirm"
             @cancel="visible = false;formRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
             class='scp-modal'
    >
      <template #footer>
        <a-button key="back" @click="visible = false;formRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirm">保存</a-button>
      </template>
      <a-form :model="formState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="formRules"
              ref="formRef"
              class='common-modal'>

        <a-form-item label="课包名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear>
          <a-input v-model:value="formState.name" placeholder="请输入课包名称" @pressEnter='groupingConfirm'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:formState.name?.length>25? 'red':'inherit'
                }"
          >
          {{formState.name?.length || 0}}/50</span>
        </a-form-item>
        <div style='transform: translate(27px, -11px);color: #b7adad;'>注意: 建议长度为25个字符，过长不能保证在学员端的展示效果哦~</div>

        <a-form-item label="课包类型" name="teachType" hasFeedback>
          <a-select v-model:value="formState.teachType"
                    placeholder="请选择课包类型"
                    allowClear showSearch
                    :disabled='curEditData.status === "1"'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="11" key='11' v-if='(!curEditData.name) || curEditData.teachType !== "22"'>面授
            </a-select-option>
            <a-select-option value="12" key='12' v-if='(!curEditData.name) || curEditData.teachType !== "22"'>双师
            </a-select-option>
            <a-select-option value="21" key='21' v-if='(!curEditData.name) || curEditData.teachType !== "22"'>直播
            </a-select-option>
            <a-select-option value="22" key='22' v-if='(!curEditData.name) || curEditData.teachType === "22"'>录播
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="所属课程" name="selectedCourse" hasFeedback>
          <a-select v-model:value="formState.selectedCourse"
                    placeholder="请选择所属课程"
                    allowClear
                    showSearch
                    :disabled='isEdit'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option :value="item.id"
                             :key='item.id'
                             v-for='item of courseListSelect'
            >{{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="做题模式" name="exerciseType" hasFeedback style='width:93%;position:relative'>
          <a-select v-model:value="formState.exerciseType" placeholder="请选择做题模式" allowClear showSearch
                    :disabled='isEdit'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1" key='1'>可重做模式</a-select-option>
            <a-select-option value="2" key='2'>不可重做模式</a-select-option>
          </a-select>
          <a-tooltip :overlayStyle='{"max-width": "300px"}'>
            <template #title>
              <div>
                可重做模式：作业/考试任务没有结束时间，学员可随时做题，可重做作业/考试任务，作业任务可随时查看答案。
              </div>
              <div>
                不可重做模式：作业/考试任务有结束时间，学员的作业/考试任务不能重做，作业/考试任务结束后才能查看答案。
              </div>
              <br>
              注意：选择做题模式后不能修改，请谨慎选择。选择做题模式后该课包下全部作业/考试任务都是按照该模式进行做题。
            </template>
            <QuestionCircleOutlined class='font-question'
                                    style='margin:0 0 10px 8px;position:absolute;top:5px;right:-30px'/>
          </a-tooltip>
        </a-form-item>

        <a-form-item label="课程科目类型" name="courseSubjectTypeId" hasFeedback>
          <a-spin :spinning='loading' :delay='1000'>
            <a-select v-model:value="formState.courseSubjectTypeId" placeholder="请选择课程科目类型" allowClear showSearch
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.VALUE"
                               :key='item.VALUE'
                               v-for='item of courseSubjectTypeArr'
              >{{item.NAME}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item label="创建人" v-if='isEdit'>
          <a-input v-model:value="curEditData.nickName" disabled/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="labelSetVisible"
             :title="`标签设置`"
             @ok="labelSetConfirm"
             @cancel="labelSetVisible = false;"
             :closable='true'
             :width='600'
             :maskClosable='false'
             class='scp-modal'
    >
      <template #footer>
        <a-button key="back" @click="labelSetVisible = false;">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="labelSetConfirm">保存</a-button>
      </template>

      <a-row>
        <a-col :span="4" style="text-align: right"><span>课包名称：</span></a-col>
        <a-col :span="20">
          <span>{{labelSetPkgInfo.name}}</span>
        </a-col>
      </a-row>

      <a-row class='mt15' v-if='phaseLabelList?.length'>
        <a-col :span="4" class='mt3 tr'><span>考期标签：</span></a-col>
        <a-col :span="20">
          <a-select v-model:value="phaseLabel"
                    placeholder="请选择考期标签"
                    allowClear
                    style='width:90%'
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option :value="item.id"
                             :key='item.id'
                             v-for='item of phaseLabelList'
            >{{item.name}}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <a-row class='mt15' v-if='testPeriodLabelList?.length'>
        <a-col :span="4" class='mt3 tr'><span>阶段标签：</span></a-col>
        <a-col :span="20">
          <a-select v-model:value="testPeriodLabel"
                    placeholder="请选择阶段标签"
                    style='width:90%'
                    allowClear
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option :value="item.id"
                             :key='item.id'
                             v-for='item of testPeriodLabelList'
            >{{item.name}}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <a-row v-if='!testPeriodLabelList?.length && !phaseLabelList?.length' class='mt15'>
        <a-col :span="4" class='tr'><span>提示：</span></a-col>
        <a-col :span="20">
          该课包所属学科未配置标签，如需使用标签请联系学科管理人添加标签！
        </a-col>
      </a-row>

    </a-modal>

    <a-modal v-model:visible="groupingVisible"
             title="课包分组"
             @cancel='groupingVisible = false;groupingFormRef.clearValidate()'
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="groupingVisible = false;groupingFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="groupingConfirm">保存</a-button>
      </template>
      <a-form :model="groupingFormState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="groupingFormRules"
              ref="groupingFormRef"
              class='common-modal'>

        <a-form-item label="系列名称" name="series" hasFeedback>
          <a-spin :spinning='loading' :delay='1000'>
            <a-select v-model:value="groupingFormState.series"
                      placeholder="请选择系列名称"
                      allowClear
                      showSearch
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                      @change='seriesChange'
            >
              <a-select-option :value="item.id" v-for='item in groupingLabels' :key='item.id'>{{item.name}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item label="课包版本"
                     name="packetVer"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear
                     :wrapper-col="{ span: 10 }"
        >
          <a-spin :spinning='loading' :delay='1000'>
            <a-input-number v-model:value="groupingFormState.packetVer" :min="1" :step="1" placeholder='请输入课包版本'
                            :precision='0' style='width:150px;' @pressEnter='groupingConfirm'/>
          </a-spin>
        </a-form-item>
        <div style='transform: translate(27px, -2px);color: #b7adad;'>课包版本是指同系列中不同版本，数字越大版本越高</div>
      </a-form>
    </a-modal>

    <a-drawer
      title="所属校区"
      :width='500'
      placement="right"
      :closable='false'
      :maskClosable='false'
      :visible="campusVisible"
      :wrap-style="{ position: 'absolute' ,'text-align':'left'}"
      @cancel="campusVisible = false;campusFormState.clearValidate()"
    >
      <a-spin :spinning='loading' :delay='1000'>
        <a-form :model="campusFormState"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 18 }"
                :rules="campusFormRules"
                ref="capmusFormRef"
                class='common-modal'>
          <a-form-item label="所属校区" name="ocodes">
            <a-spin :spinning='loading' :delay='1000'>
              <a-tree-select
                v-model:value="campusFormState.ocodes"
                style="width: 76%;margin-right:20px;"
                :tree-data="affiliatedCampusTreeData"
                tree-checkable
                treeNodeFilterProp='title'
                allow-clear
                :maxTagCount='10'
                :maxTagPlaceholder='(omittedValues)=>(`还有 ${omittedValues.length} 个校区/大区...`)'
                :show-checked-strategy="SHOW_PARENT"
                search-placeholder="请选择所属校区"
                @change='campusTreeChange'
              >
              </a-tree-select>
              <a-checkbox v-model:checked="affiliatedCampusChecked" @change='affiliatedCampusCheckedChange'>全选
              </a-checkbox>
            </a-spin>
          </a-form-item>
          <div class="submit-button">
            <a-button key="back" @click="campusVisible = false;capmusFormRef.clearValidate()" style='margin-right:10px'>
              取消
            </a-button>
            <a-button key="submit" type="primary" :loading="loading" @click="capmusConfirm">保存</a-button>
          </div>
        </a-form>
      </a-spin>
    </a-drawer>
  </a-layout>
</template>
<script lang="ts">
import ScpList from './scp-list'

export default ScpList
</script>
<style lang="less" scoped>
  @import './scp-list';
</style>
