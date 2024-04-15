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

import {Player, PlayerMgr} from "../Mahjong/World/Entity/Player/Player";
import { SceneMgr } from '../framework/mgr/SceneMgr';

/**
 * 开放对外接口
 */
export type Constructor<T = unknown> = new (...args: any[]) => T;

export class App {
    // 初始化app变量
    private static initApp: boolean = false;

    /**
     * 获取单例
     * @param constructor
     * @returns
     */
    public static getInst<T>(constructor: Constructor<T>): T {
        return constructor[`_ins`];
    }

    public static Init(): void {
        if (this.initApp) {
            return;
        }
        this.initApp = true;
        // 在HomeInit中初始话，在数据回来比较快的情况下会导致空
        if (!PlayerMgr.ins) {
            PlayerMgr.ins = new PlayerMgr();
        }
        if (!PlayerMgr.ins.local) {
            PlayerMgr.ins.local = new Player();
        }
        console.log("seatoriend:", PlayerMgr.ins.local.gameData.seatOrien);
        console.log("player mgr:", PlayerMgr.ins);
        SceneMgr.loadPrefabRes();
    }
}

window[`App`] = App;