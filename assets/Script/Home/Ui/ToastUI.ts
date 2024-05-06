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

import {Node} from "cc";
import {eLayer, eSysId, ViewMgr} from "../../framework/mgr/ViewMgr";
import {Singleton} from "../../framework/mgr/Singleton";
import {App} from "../../Module/App";
 
export class ToastUI extends Singleton {
    protected static instance: ToastUI
    public root: Node = null;

    public toInit(node: Node) {
        this.root = node;
    } 

    public showTips(mTips: string) {
        let mgr = App.getInst(ViewMgr);
        mgr.open(eSysId.ToastUIPref, [mTips], mgr.getLayer(eLayer.popUpWinLayer) || this.root);
    }

    public toHide() {
        this.root.active = false;
    }
}
