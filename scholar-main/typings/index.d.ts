// <reference path="custom-typings.d.ts" />
import 'custom-typings.d.'
declare global {
  interface Window {
    __platform__: string;
    __POWERED_BY_QIANKUN__:boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__:string;
    __webpack_public_path__:string;
  }
}
