## SEEAI教研PC端
作为微服务主应用启动,公共预览调用ky-file-web微应用

## 技术栈
vue3+typescript+antd+qiankun

## 项目运行
1. 拉取代码 git clone https://gitee.com/qi-course/ky-scholar-web-vue.git
2. 安装整个微服务依赖 yarn
3. 运行整个微服务 yarn start
- 主应用访问地址  http://127.0.0.1:8300/scholar/#/**
    - 主应用路由系统  http://127.0.0.1:8300/scholar/#/scholar/**
    - 示例微应用路由系统 http://127.0.0.1:8300/scholar/#/scholar-sub/**
- 示例微应用单独访问地址 http://127.0.0.1:8301/scholar-sub/#/**
4. 单独运行主应用 yarn run start:scholar-main 或 cd scholar-main && yarn start 
应用访问地址  http://127.0.0.1:8300/scholar/#/**
5. 单独运行示例微应用 yarn run start:scholar-sub 或 cd scholar-sub && yarn start
应用访问地址  http://127.0.0.1:8301/scholar-sub/#/**

6. 环境变量注入

配置相关
- VUE_APP_deploy：0 | 1 用来标志是否用来部署，为1时在eslint检测debugger/console警告，注册serviceWorker和进行gzip压缩，抽离主题文件
- VUE_APP_SourceMap：0 | 1 开发环境一定会有源码映射，部署环境下控制sourceMap生成
- NODE_ENV：vue和插件系统依赖内部进行优化处理
- VUE_APP_environment：微服务区分不同配置环境
- VUE_APP_HTTPS：开发环境是否开启https

题库相关
- VUE_APP_questionBank：题库后台地址，如增加问卷试卷用
- VUE_APP_tkPage：题库前台地址，如做试卷问卷用
- VUE_APP_questionBankGateway：智适应题库api服务域名(只抽题)
- VUE_APP_questionBankApi：题库网关地址
- VUE_APP_paperApi：swagger做题api服务域名

保利威相关
- VUE_APP_polywayApi：保利威API接口前缀
- VUE_APP_polywayUpload：保利威上传视频接口前缀
- VUE_APP_writetoken：保利威文件写token
- VUE_APP_cataid：启课程加密分类id
- VUE_APP_userid：保利威用户id
- VUE_APP_secretkey：保利威密钥

后端对接相关
- VUE_APP_commonViewer：公共服务预览的地址
- VUE_APP_endpoint：oss访问域名
- VUE_APP_OSS_URL：oss资源路径前缀
- VUE_APP_SERVER_URL：seeai后台接口地址前缀

nc相关
- VUE_APP_ncCourseType：nc课程科目类型接口地址前缀

## 目录结构
由于vue3对typescript的支持已经成熟，不采用装饰器的写法，也省去了`class-style component syntax`中`vue-class-component`和扩展`vue-property-decorator`插件的安装。
**主业务逻辑在scholar-main主应用开发部署即可**。
```sh
- scholar-main                                       微服务主应用
    |- doc/                                          项目关键技术文档
    |- script/                                       工具脚本
        |- git/                                      git相关脚本
        |- utils/                                    项目外工具方法和调试方法
    |- public/                                       首页模板资源
        |- index.html
    |- localfile/                                    本地文件服务器文件存放位置
    |- server/                                       本地项目托管，用来模拟生产情况等
        |- csr.key                                   https认证key
        |- file.crt                                  https证书
        |- private.key                               https私钥
        |- server.js                                 本地服务托管
        |- fileServer.js                             本地文件服务器
    |- layout/                                       全局布局模块组件
        |- AppIndex.vue                              总业务承载组件
        |- Home.vue                                  其他边缘业务组件
        |- Login.vue                                 登录
    |- deploy/                                       部署相关
    |- typings/                                      编辑器类型定义扩展
        |- index.d.ts
    	|- custom-typings.d.ts
    |- local/                                        本地服托管的目录，用来多项目同域联调，不参与项目编译
    |- src/                                          项目主代码
        |- app/                                      总业务逻辑
            |- api/                                  后端api联调
                |- common/                           公共请求接口
                |- auth.ts                           认证
                |- error-code.ts                     错误码
                |- http.ts                           公共请求方法
                |- interceptors.ts                   请求拦截器
                |- requestInstant.ts                 源实例
                |- index.ts                          总导出
            |- router/                               总路由注册
                |- guard.ts                          路由拦截器
                |- index.ts                          总路由管理
            |- store/                                总数据仓库注册
                |- index.ts                          总状态管理
            |- views/                                总业务逻辑代码
                 |- demo-construct/                  单模块
                    |- api/                          单模块请求方法清单
                         |- demo-children.api.ts     子组件请求方法清单
                         |- demo-construct.api.ts    模块组件请求方法清单
                         |- index.ts
                    |- components/                   单模块组件
                         |- demo-children.vue        子组件
                         |- index.ts                 子组件导出
                    |- demo-construct.vue            单模块入口组件
                    |- demo-construct.route.ts       单模块子路由
                    |- demo-construct.store.ts       单模块子数据仓库
                    |- demo-construct.util.ts        单模块工具方法
                    |- demo-construct-constants.ts   单模块常量定义
                    |- index.ts                      单模块导出
        |- assets/                                   静态文件资源
            |- iconfont/                             图标
            |- images/                               图片
            |- plugins                               第三方插件总注册
                |- antd.ts                           antd按需注册
                |- global-svg.ts                     svg全局注册
                |- index.ts                          插件总导出
            |- svg/                                  所有svg图片，创建即注册
        |- common /                                  公共服复用逻辑
            |- base/                                 全局泛型
                |- enum.ts                           公共枚举
                |- common.ts                         公共泛型
                |- index.ts
            |- components/                           公共组件
                |- index.ts
                |- svg-icon/                         单个公共组件
                    |- index.ts
                    |- svg-icon.vue                  单个公共组件逻辑
                    |- svg-icon.scss                 单个公共组件样式
                    |- README.md                     单个组件用法说明
            |- constants/                            公共常量
                |- index.ts
                |- uploadDir.ts                      oss目录常量
                |- static-data.ts                    全局常量
            |- directives/                           公共指令
                |- index.ts
                |- click-outside.ts                  单个指令
                |- README.md                         指令用途说明
            |- mixins/                               公共混入
                |- index.ts
                |- base.ts                           公共逻辑
            |- services/                             公共服务
                |- index.ts
                |- normal-menu/                      单个服务
                     |- normal-menu.scss             样式
                     |- normal-menu.scss             逻辑
                     |- README.md                    服务用途说明
            |- utils/                                公共工具类
                |- index.ts
                |- localstorage.util.ts              本地数据操作工具
                |- sessionstorage.util.ts            会话数据操作工具
                |- tools.util.ts                     通用工具
                |- common.ts                         公共工具
                |- crypto.ts                         加盐算法
                |- base64.ts                         base64解码加码
                |- download.ts                       oss下载
                |- uuid.ts                           随机串
                |- validator.ts                      全局正则
            |- index.ts
    |- style/                                        全局样式
    	|- index.scss
        |- style.scss                                全局样式定义
        |- _mixin.scss                               全局样式工具
    	|- reset.scss                                清零化样式
        |- normalize.scss                            归一化样式
    |- theme/                                        主题
        |- default/                                  默认主题
            |- index.scss
            |- _variable.scss                        修改组件主题变量列表
    |- App.vue                                       主组件入口
    |- main.ts                                       单页面启动入口
    |- polyfills.js                                  兼容垫片
    |- vue.config.js                                 vue全局配置
    |- README.md                                     项目主要信息介绍
    |- release-prod.log                              正式线发版记录
    |- release-test.log                              测试线发版记录
    |- CHANGELOG.zh-CN.md                            项目版本更新中文记录
    |- .env.development                              开发环境变量注入
    |- .env.intranet                                 beta环境变量注入
    |- .env.production                               生产环境变量注入
    |- .env.test                                     测试环境变量注入
    |- .eslintrc.js                                  eslint全局配置
    |- tsconfig.json                                 tslint全局配置
    |- babel.config.js                               babel编译配置
    |- .npmrc                                        npm变量配置
    |- .yarnrc                                       yarn变量配置
|- scholar-sub                                       微服务示例微应用
|- scholar-other-sub                                 微服务示例微应用
|- package.json                                      微服务总配置文件
```

## 部署情况
1. 网校WEB地址
- 测试地址：http://school.beta.hqjy.com/﻿
- 正式地址：https://www.hqjy.com/﻿
﻿
2. seeai-测试线地址
- 总控制台：http://seeai-test.beta.hqjy.com/micro-console﻿-main/#/**
- 运营工作台：http://seeai-test.beta.hqjy.com/micro-operator-main/?xxx﻿﻿#/**
- 教务工作台：http://seeai-test.beta.hqjy.com/micro-officer-main/?xxx﻿﻿#/**
- 教研工作台：http://seeai-test.beta.hqjy.com/scholar/?xxx﻿﻿#/**
- 讲师工作台：http://seeai-test.beta.hqjy.com/micro-teacher-main/?xxx﻿#/**
- 学生工作台PC：http://seeai-test.beta.hqjy.com/scholar/?xxx﻿﻿#/**
﻿
3. seeai-正式线地址
- 总控制台：https://﻿seeai.hqjy.com/micro-console﻿-main/#/**   
- 运营工作台：https://﻿seeai.hqjy.com﻿/micro-operator﻿-main/?xxx﻿#/**
- 教务工作台：https://﻿seeai.hqjy.com﻿/micro-officer﻿-main/?xxx﻿#/**
- 教研工作台：https://﻿seeai.hqjy.com﻿/micro-scholar﻿-main/?xxx﻿#/**
- 讲师工作台：https://﻿seeai.hqjy.com﻿/micro-teacher﻿-main/?xxx﻿#/**
- 学生工作台PC：https://﻿seeai.hqjy.com﻿/micro-student﻿-main/?xxx﻿#/**
﻿
4. 账号规则
- 总控制台：admin/qkc123456
- 运营工作台：admin/qkc123456
- 其他工作台：手机号/qkc123456
﻿
5. jenkins发布平台
- 地址：http://10.0.98.147:8088/
- 账号：seeaiweb/qkc123

6. 99数字：http://dev.99shuzi.com/

7. 剧本平台（具体使用细节可以咨询-张小玲）
- 管理端测试地址：admin/123456
- http://ky.qicourse.cn/scenario/manage/#/login
- 剧本平台教师端测试地址：
- http://ky.qicourse.cn/scenario/scholar/#/login
- 学生端和h5需基于某个剧本打开，类似：
- http://ky.qicourse.cn/scenario/student/#/login/7a5d328fce9ef21a476141e227bff544/2fc54ce3088edc557560b2deb0f955fb/1
- http://ky.qicourse.cn/scenario/student/#/login/剧本id/剧本版本id/剧本版本

8. 主应用和微应用分别单独部署即可。 

## 项目优化点建议
+ 开发中待补充

## 分支介绍
+ dev 最新代码分支 
+ master 生产发版分支
+ test 测试发版分支

## GIT 规范
1. **禁止使用无意义的版本提交信息，如111。**
2. **解决冲突后注释提交请保留fix:conflict的冲突标志。**
3. 考虑到编码效率放开commit拦截手动提交日志时，建议在提交注释增加type:并且只是用以下几种：
	- feat：新功能
	- fix：修补bug
	- docs：文档（documentation）
	- style： 样式（不影响代码运行的变动）
	- refactor：重构（即不是新增功能，也不是修改bug的代码变动，属于逻辑优化的范畴）
	- test：增加测试
	- chore：构建过程或辅助工具的变动
	- alter：需求导致代码逻辑调整

```sh
举个例子：
feat：新增个人学习中心
fix: 修正学习中心跳转链接错误
```

## 主要原型地址
+ [seeai蓝湖原型地址](https://lanhuapp.com/web/#/item/project/stage?pid=13decb9b-f44d-439a-811e-df5c54f16636)
+ [题库axhub原型地址](https://axhub.im/ax9/5f51a1202a64b135/#g=1&id=zbdj8b&p=%E5%90%8E%E5%8F%B0%E4%B8%80%E6%9C%9F%E4%BF%AE%E8%AE%A2%E8%AE%B0%E5%BD%95)
+ 蓝湖公共账号：
    - adamluo2003@qq.com/lanhu888888（郑光勇）
    - 1085610024@qq.com/1qaz2wsx（谭宇栩）
    - m13435089677@163.com abcd930821（叶雷、邹家和）
    - 772941190@qq.com/xi931214（马景文）

## swagger-ui/yapi
+ [统计信息服务接口地址](http://10.0.98.148:20210/doc.html)
+ [学生Yapi](http://10.0.103.2:3000/project/29/interface/api/cat_331)
+ [题库Yapi](http://tikuyapi.beta.hqjy.com/project/116/interface/api)
+ [题库内核层接口文档V1.0](http://10.0.98.146:6001/tk/swagger-ui.html#/)

## 项目注意点
1. [团队合作开发规范要点](http://wiki.hqbis.com/docs/technology/vue-cooperation)
2. [微前端方案的思考](http://wiki.hqbis.com/docs/technology/qiankun) 
3. [ow365](https://officeweb365.com/Help/Default/5)
4. [wps-jsSDK](https://wwo.wps.cn/docs-js-sdk/#/)
5. [百度统计](https://tongji.baidu.com/web/welcome/login)
    - 公共账号 gzqkc2019
    - 公共密码 1qaz2WSX
6. [保利威](https://dev.polyv.net/2020/videoproduct/v-player-sdk/v-player-sdk-web/v-player-sdk-web-feature/play/)
    - 公共账号 flitzjohn@dingtalk.com
    - 公共密码 1qaz2wsx
7. 测试线：可用实训资源 （note:  账期ID不能重复录入 ，实训跳转，只有内网才能打开 ）
    - 课程账套名称  账套编码
    - 恒生塑胶  0006
    - 恒图科技  0007
    - 恒润物流  0008
    - 恒然建筑  0009
    - 恒兆物业  0010
    - 铭诚塑料  0011
    - 凌阳科技  0012
    - 港通物流  0013
    - 金桥建筑  0014
    - 宝利物业  0015
    - 启特地产  0016
    - 恒沐大酒店  0017
    - 恒远旅游  0018
    - 恒陵国际  0019
    - 启盟电子商务  0020
    - 测试课程（三赢）  Sample
    
8. seeai项目操作指引：
    1. 创建渠道：超级管理员账号登录「总控制台」——》创建渠道(其中渠道code需要记住，登录其他工作台需要带上)
    2. 创建员工账号：运营管理员账号登录「运营工作台」(地址带上渠道code)——》创建校区——》创建员工账号——》授权需要登录的工作台和角色
    3. 创建资源和课程：教研账号登录「教研工作台」(地址带上渠道code)——》创建学科、学科结构、资源——》创建专业、课程、课包
    4. 进行排课：教务账号登录「教务工作台」(地址带上渠道code)——》创建时点档案、教室档案、班型档案、学员档案——》创建排课计划——》审核通过后加入学员
    5. 讲师上课：讲师账号登录「讲师工作台」(地址带上渠道code)——》操作自己领悟
    6. 学员上课：学员账号登录「学员工作台」——》操作自己领悟

9. [SEEAI项目标准开发脚手架](http://oss.xccjh.top/vuebloger/)
10. [SEEAI标准项目模板gitee源](https://gitee.com/xccjh-zjh)

## 项目团队成员
1. 测试：罗文峰，谢久蜜，聂艳杰，王海杭，彭心甜，杨永梅
2. 产品：何烨，罗展雄，习瑞东
3. 后台：黎扬荣，唐赞勇，高道马，周瑜鸿，王吕伊华，陈康明
4. 前端：邹家和，叶雷，马景文，谭宇栩，郑佳锚，李德南，梁国泉

### 前端各板块负责人
1. 教务工作台：郑佳锚，梁国泉
2. 教研工作台：邹家和
3. 运营工作台：马景文，郑佳锚
4. 讲师端：李德南，谭宇栩
5. 学员PC端：马景文，邹家和，谭宇栩
6. 学员H5端：叶雷，邹家和，苏善泳
7. 剧本平台：郑光勇
