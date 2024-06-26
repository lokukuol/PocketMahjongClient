/****************************************************************************
 Copyright (c) Bit Technologies Inc.

 代码：https://github.com/openpokergame/PocketMahjongClient.git

 官网一：http://qipaiplay.com

 官网二：http://openpokergame.net

 玩法博客：http://www.xgeplayer.com

 email: openpokerorg@gmail.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

import {_decorator, Button, Component, EditBox, EventTouch, Node, sys, Toggle, tween, Tween} from 'cc';
import {LocalCacheManager} from '../../framework/cache/local-cache';
import {EEventListenerPriority, ProtocolEventManager} from '../../framework/event/event-management';
import {SceneMgr} from '../../framework/mgr/SceneMgr';
import {ProtocolHTTPManager} from '../../framework/network/http';
import {EProtocolID} from '../../framework/network/protocol-configs';
import {CommUtils} from '../../framework/utils/CommUtils';
import {GlobalVar} from '../../GlobalVar';
import {LoginEnity} from '../../Home/Entity/Login';
import {ToastUI} from '../../Home/Ui/ToastUI';
import {App} from '../../Module/App';
import {UiPopupHelper} from '../../framework/utils/UiPopupHelper';
import {LoginCountryCodeUI} from './LoginCountryCodeUI';
import {LoginUiMain} from './LoginUiMain';
import { LoginInit } from '../World/LoginInit';

const {ccclass, property} = _decorator;

@ccclass('LoginPhoneUI')
export class LoginPhoneUI extends Component {
    private _closeBtn: Button = null;
    private _phoneEB: EditBox = null;
    private _phoneDelBtn: Node = null;

    private _passEB: EditBox = null;
    private _passShowBtn: Node | null = null;
    private _passOpen: Node | null = null;
    private _passClose: Node | null = null;
    private _passDelBtn: Node = null;

    private _forgetPassBtn: Node = null;
    private _registerBtn: Node = null;

    private _confirmBtn: Node = null;
    private _codeLoginBtn: Node = null;

    private _agreeToggle: Toggle = null;
    private _agreeLabelNode: Node = null;
    private _protocolButton: Button | null = null;

    private _countryCodeUI: LoginCountryCodeUI = null;

    private _showPass: boolean = false;
    private _isConfirmBtnAble: boolean = true;
    private _tweenAct: Tween<Node> = null;

    onLoad(): void {
        this._phoneEB = this.node.getChildByPath("bg/phoneEB").getComponent(EditBox);
        this._phoneDelBtn = this.node.getChildByPath("bg/phoneDelBtn");

        this._passEB = this.node.getChildByPath("bg/passEB").getComponent(EditBox);
        this._passShowBtn = this.node.getChildByPath("bg/passShowBtn");
        this._passClose = this.node.getChildByPath("bg/passShowBtn/close");
        this._passOpen = this.node.getChildByPath("bg/passShowBtn/open");
        this._passDelBtn = this.node.getChildByPath("bg/passDelBtn");

        this._forgetPassBtn = this.node.getChildByPath("bg/forgetPassBtn");
        this._registerBtn = this.node.getChildByPath("bg/registerBtn");

        this._confirmBtn = this.node.getChildByPath("bg/confirmBtn");
        this._codeLoginBtn = this.node.getChildByPath("bg/codeLoginBtn");

        this._agreeToggle = this.node.getChildByPath("bg/Node/agreeToggle").getComponent(Toggle);
        this._agreeLabelNode = this.node.getChildByPath("bg/Node/Label");
        this._protocolButton = this.node.getChildByPath("bg/Node/ProtocolButton").getComponent(Button);

        this._countryCodeUI = this.node.getChildByPath("bg/CountryCodePref").getComponent(LoginCountryCodeUI);
        this._closeBtn = this.node.getChildByPath("bg/closeBtn").getComponent(Button);

        this._phoneEB.node.on(EditBox.EventType.EDITING_DID_ENDED, this._onPhoneEditEnd, this);
        this._phoneDelBtn.on(Node.EventType.TOUCH_END, this._onPhoneDelTouch, this);

        this._passShowBtn.on(Node.EventType.TOUCH_END, this._onPassShowBtnTouch, this);
        this._passDelBtn.on(Node.EventType.TOUCH_END, this._onPassDelTouch, this);

        this._forgetPassBtn.on(Node.EventType.TOUCH_END, this._onForgetPassTouch, this);
        this._registerBtn.on(Node.EventType.TOUCH_END, this._onRegisterTouch, this);

        this._confirmBtn.on(Button.EventType.CLICK, this._onConfirmButtonClick, this);
        this._codeLoginBtn.on(Button.EventType.CLICK, this._onCodeLoginButtonClick, this);

        this._agreeLabelNode.on(Node.EventType.TOUCH_END, this._onAgreeLabelTouch, this);
        this._protocolButton.node.on(Button.EventType.CLICK, this._onProtocolButtonClick, this);

        this._showPass = false;
        this._passClose.active = true;
        this._passOpen.active = false;

        this._closeBtn.node.on(Button.EventType.CLICK, this.closeLoginDia, this);

        ProtocolEventManager.on(EProtocolID.ACCOUNT_TOKEN, this._onAccountRespond, this, EEventListenerPriority.HIGHER);
    }

    start(): void {
        // 获取账号信息
        const cacheLogin = LocalCacheManager.read("login");
        if (cacheLogin) {
            if (cacheLogin.account) {
                this._phoneEB.string = cacheLogin.account;
                this._passEB.string = cacheLogin.pass;

                LoginEnity.inputPhone = this._phoneEB.string;
            }

            if (cacheLogin.countryID !== null && cacheLogin.countryID !== undefined) {
                this._countryCodeUI.countryID = cacheLogin.countryID;
                LoginEnity.countryID = cacheLogin.countryID;
            }
        }
    }

    private _onPhoneEditEnd(evt: EditBox) {
        let val = this._phoneEB.string;
        if (CommUtils.checkPhoneNumber(val, this._countryCodeUI.countryCode)) {
            console.log("输入正确，手机号：", val);
            LoginEnity.inputPhone = val;
        } else {
            console.log("输入错误，重新输入");
        }
    }

    private _onPhoneDelTouch(): void {
        this._phoneEB.string = "";
        LoginEnity.inputPhone = "";
    }

    private _onPassShowBtnTouch(evt: EventTouch) {
        console.log("touch end:", evt);
        this._showPass = !this._showPass;
        if (this._showPass) {
            this._passEB.inputFlag = EditBox.InputFlag.DEFAULT;
            this._passClose.active = false;
            this._passOpen.active = true;
        } else {
            this._passEB.inputFlag = EditBox.InputFlag.PASSWORD;
            this._passClose.active = true;
            this._passOpen.active = false;
        }
    }

    private _onPassDelTouch(): void {
        this._passEB.string = "";
    }

    private _onForgetPassTouch(evt: EventTouch) {
        LoginEnity.countryID = this._countryCodeUI.countryID;
        this.node.destroy();
        LoginUiMain.ins.uiModuleMgr.showLoginUI("ForgetPassPref", "LoginForgetPassUI");
    }

    private _onRegisterTouch(evt: EventTouch) {
        LoginEnity.countryID = this._countryCodeUI.countryID;
        this.node.destroy();
        LoginUiMain.ins.uiModuleMgr.showLoginUI("RegisterPref", "LoginRegisterUI");
    }

    private _onCodeLoginButtonClick(evt: EventTouch) {
        LoginEnity.countryID = this._countryCodeUI.countryID;
        this.node.destroy();
        LoginUiMain.ins.uiModuleMgr.showLoginUI("CodeLoginPref", "LoginCodeLoginUI");
    }

    private _onAgreeLabelTouch(): void {
        this._agreeToggle.isChecked = !this._agreeToggle.isChecked;
    }

    private _onProtocolButtonClick(evt: EventTouch): void {
        sys.openURL("http://qipaiplay.com/serverprotocol.html");
    }

    private _onConfirmButtonClick(evt: EventTouch) {
        if (!this._agreeToggle.isChecked) {
            App.getInst(ToastUI).showTips("请阅读并同意游戏许可及服务协议");
            return;
        }
        if (!CommUtils.checkPhoneNumber(this._phoneEB.string, this._countryCodeUI.countryCode)) {
            App.getInst(ToastUI).showTips("请填写有效手机号码");
            return;
        }
        if (!this._passEB.string) {
            App.getInst(ToastUI).showTips("请输入密码");
            return;
        }

        if (this._isConfirmBtnAble) {
            this._isConfirmBtnAble = false;
            this._tweenAct = tween(this.node).delay(60).call(() => {
                this._isConfirmBtnAble = true;
            }).start();
            LoginUiMain.ins.loadingND.active = true;

            let mParamObj = {
                type: 4,
                id: this._phoneEB.string,
                password: this._passEB.string,
            };
            ProtocolHTTPManager.load(EProtocolID.ACCOUNT_TOKEN, mParamObj, false);
        }
    }

    onRichTextEvent(evt) {
        console.log("rich text :", evt);
    }

    private _onAccountRespond(event): void {
        if (!this.node.active) {
            return;
        }
        LoginEnity.inputPhone = "";

        console.log("===phone pass login:", event);
        if (event.success && event.data.token) {
            LoginEnity.account = event.data["account"];
            LoginEnity.accountID = event.data["accountId"] + "";
            LoginEnity.playerID = event.data["accountId"];
            LoginEnity.token = event.data["token"];
            LoginEnity.isNewAccount = event.data["isNewAccount"];
            // 保存Token信息
            LocalCacheManager.write('account', {
                account: event.data.account,
                token: event.data.token,
                accountId: event.data.accountId + "",
                expiration: event.data.timestamp ?? undefined,
            });
            LocalCacheManager.write('login', {
                account: this._phoneEB.string,
                pass: this._passEB.string,
                countryID: this._countryCodeUI.countryID,
            });

            this.node.destroy();
            GlobalVar.willLoadMoudle = null;
            SceneMgr.runScene("Home", true);
        } else {
            if (event.data?.msg) {
                App.getInst(ToastUI).showTips(event.data.msg);
            } else {
                App.getInst(ToastUI).showTips("登录失败");
            }

            LoginUiMain.ins.loadingND.active = false;
            LoginUiMain.ins.loginND.active = true;
            if (this._tweenAct) {
                this._tweenAct.stop();
            }
            this._isConfirmBtnAble = true;
        }
    }

    onDestroy(): void {
        ProtocolEventManager.off(EProtocolID.ACCOUNT_TOKEN, this._onAccountRespond, this);
    }

    // 更新数据用，必备
    public refresh(): void {
        this.node.active = true;
        this._isConfirmBtnAble = true;
        if (this._tweenAct) {
            this._tweenAct.stop();
        }
        UiPopupHelper.show(this.node);
    }

    public closeLoginDia(): void {
        console.log("close login dia");
        this.node.destroy();
        LoginInit.hidePhoneLogin();
    }

    // public toShow() {
    //     this.node.active = true;
    //     this._isConfirmBtnAble = true;
    //     if (this._tweenAct) {
    //         this._tweenAct.stop();
    //     }
    //     UiPopupHelper.show(this.node);
    // }

    // public toHide() {
    //     this.node.active = false;
    // }

    // public toDestroy() {
    //     ProtocolEventManager.off(EProtocolID.ACCOUNT_TOKEN, this._onAccountRespond, this);
    // }
}
