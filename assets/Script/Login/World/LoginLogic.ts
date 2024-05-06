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

import { _decorator, Component, Node, tween, Tween, Vec3 } from 'cc';
import { LoginInit } from './LoginInit';
import { ProtocolHTTPManager } from '../../framework/network/http';
import { LocalCacheManager } from '../../framework/cache/local-cache';
import { GlobalVar } from '../../GlobalVar';
import { SceneMgr } from '../../framework/mgr/SceneMgr';
import { EEventListenerPriority, ProtocolEventManager } from '../../framework/event/event-management';
import { EProtocolID, protocol } from '../../framework/network/protocol-configs';
import { LoginEnity } from '../../Home/Entity/Login';
import { App } from '../../Module/App';
import { AppVar } from '../../Module/AppVar';
import { LoginUiMain } from '../Ui/LoginUiMain';
import { ToastUI } from '../../Home/Ui/ToastUI';
import { device } from "../../native/device";
import { E_LOGIN_MODE } from "../../const/EnumConst";
import { RoleCtrl } from "../../Module/role/RoleCtrl";
import { BagCtrl } from "../../Module/bag/BagCtrl";
import { ItemTableTemplate } from "../../data/templates/item-table-data";
import { SettingCtrl } from "../../Module/Setting/SettingCtrl";
import { ShopCtrl } from "../../Module/store/ShopCtrl";
import { ClubCtrl } from "../../Module/club/ClubCtrl";
import { CallBack } from "../../framework/utils/CallBack";

const { ccclass, property } = _decorator;

@ccclass('LoginLogic')
export class LoginLogic extends Component {
    @property(Node)
    public btnNode_: Node;
    @property(Node)
    public btnGuest_: Node;
    @property(Node)
    public btnPhone_: Node;

    private _isConfirmBtnAble: boolean = true;
    private _tweenAct: Tween<Node> = null;

    start() {
        ProtocolEventManager.on(EProtocolID.ACCOUNT_TOKEN, this._onAccountRespond, this, EEventListenerPriority.HIGHER);

    }

    update(deltaTime: number) {
        
    }
    
    onDestroy(): void {
        ProtocolEventManager.off(EProtocolID.ACCOUNT_TOKEN, this._onAccountRespond, this);
    }

    public callbackPhoneLogin() {
        console.log("phone login");
        LoginInit.showPhoneLogin(this.btnNode_);
        this.btnNode_.active = false;
    }

    public callbackGuestLogin() {
        console.log("guest login");
        this.btnNode_.active = false;
        if (this._isConfirmBtnAble) {
            this._isConfirmBtnAble = false;
            this._tweenAct = tween(this.btnNode_).delay(60).call(() => {
                this._isConfirmBtnAble = true;
                LoginUiMain.ins.loadingND.active = false;
                console.log("amin over");
                this.btnNode_.active = true;
                this.node.active = true;
            }).start();
            LoginUiMain.ins.loadingND.active = true;
            this.node.active = true;
            device.fetchDeviceID(deviceID => {
                if (deviceID == undefined || deviceID == null) {
                    return;
                } 
                let mParamObj = {
                    type: 0,
                    id: deviceID,
                    password: ""
                }; 
                ProtocolHTTPManager.load(EProtocolID.ACCOUNT_TOKEN, mParamObj, false);
                console.log("发送请求 游客登陆");
            });
        }
    }

    private _onAccountRespond(event): void {
        console.log("===phone pass login 111:", event);
        if (!this.node.active) {
            return;
        }
        this.node.active = false;
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
            if (this._tweenAct) {
                this._tweenAct.stop();
            }
            this._isConfirmBtnAble = true;
            this.btnNode_.active = true;
            this.node.active = true;
        }
    }
}

