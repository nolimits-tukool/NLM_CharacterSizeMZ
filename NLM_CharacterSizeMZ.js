/*==========================================================================
 NLM_CharacterSizeMZ.js
----------------------------------------------------------------------------
 (C)2025 NoLimits
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2025/11/24 初稿
============================================================================*/

/*:
 * @target MZ
 * @plugindesc キャラクターサイズ一括拡大プラグイン
 * @author ノリミツ (NoLimits)
 * @url https://github.com/nolimits-tukool
 * 
 * @param chara
 * @text ◆MAPキャラクター変更
 * @desc マップ上でのキャラクターサイズを変更する（デフォルト：ON）（OFF時は以下無効）
 * @type boolean
 * @default true
 * 
 * @param chMag
 * @parent chara
 * @text タテ拡大率(%)
 * @desc タテ拡大率(%)（デフォルト：150、ツクールデフォ：100）
 * @type number
 * @default 150
 * 
 * @param cwMag
 * @parent chara
 * @text ヨコ拡大率(%)
 * @desc ヨコ拡大率(%)（デフォルト：130、ツクールデフォ：100）
 * @type number
 * @default 130
 * 
 * @param cSmooth
 * @parent chara
 * @text スムーズ処理
 * @desc 画像スムーズ処理（ON時は辺縁に点や線が出ることあり）　　　（デフォルト：ON）
 * @type boolean
 * @default true
 * 
 * @param excla
 * @parent chara
 * @text ！ファイル名は除外
 * @desc 「！」の付いたファイル名（扉・宝箱など）は除外するか　　　（デフォルト：ON）
 * @type boolean
 * @default true
 * 
 * @param cExcFile
 * @parent chara
 * @text 除外キャラ画像
 * @desc サイズを変更したくないキャラクター画像
 * @type file[]
 * @dir img/characters
 * @default []
 * 
 * @param noField
 * @parent chara
 * @text フィールドで変更せず
 * @desc フィールドマップ上ではサイズを変更しない（デフォルト：OFF)
 * @type boolean
 * @default false
 * 
 * @param vehic
 * @parent chara
 * @parent noField
 * @text 乗り物は変更容認
 * @desc フィールドマップ上で乗り物のサイズ変更は容認する　　　　　（上記「フィールドで変更せず」がON時のみ有効）
 * @type boolean
 * @default true
 * 
 * @param actor
 * @text ◆戦闘SVアクター変更
 * @desc 戦闘時のSVアクターサイズを変更する（デフォルト：ON）　　　（OFF時は以下無効）
 * @type boolean
 * @default true
 * 
 * @param ahMag
 * @parent actor
 * @text タテ拡大率(%)
 * @desc タテ拡大率(%)（デフォルト：150、ツクールデフォ：100）
 * @type number
 * @default 150
 * 
 * @param awMag
 * @parent actor
 * @text ヨコ拡大率(%)
 * @desc ヨコ拡大率(%)（デフォルト：130、ツクールデフォ：100）
 * @type number
 * @default 130
 * 
 * @param aSmooth
 * @parent actor
 * @text スムーズ処理
 * @desc 画像スムーズ処理（ON時は辺縁に点や線が出ることあり）　　　（デフォルト：ON）
 * @type boolean
 * @default true
 * 
 * @param shadow
 * @parent actor
 * @text 影サイズ変更
 * @desc 影もサイズ変更するか（デフォルト：ON）
 * @type boolean
 * @default true
 * 
 * @param aExcFile
 * @parent actor
 * @text 除外アクター画像
 * @desc サイズを変更したくないSVアクター画像
 * @type file[]
 * @dir img/sv_actors
 * @default []
 * 
 * 
 * @help
 * 
 * 【RPGツクールMZ専用プラグイン】（v1.0.0）
 * MAPキャラクター と 戦闘SVアクター の画像サイズを一括で拡大します
 * 　画面解像度を高くすると、キャラが全体的に小さく感じるため作りました
 * 　キャラ画像の縦横比も変えられます
 * 
 * パラメータで除外するキャラ画像を指定できます
 * （今のところ、ファイル単位でないと指定できません）
 * 
 * ※ 拡大処理時に画像辺縁にジャギー（微細不要な点や線）が出る場合があり、
 * 　気になる方は スムーズ処理を OFF にして下さい
 * ※ MAPキャラクターの当たり判定は変化せず足元にあるので、あまりサイズを
 * 　大きくすると、イベントが接触しにくくなるので注意して下さい
 * ※ 画像サイズを変更する他のプラグインと競合しやすい点は御了承ください
 * 　　（CharacterGraphicsExtend.js とは ある程度 共存できます）
 * プラグインコマンドはありません
 * 利用規約はMITライセンスの通りです
 */

(() => {
    "use strict";

    const pluginName = "NLM_CharacterSizeMZ";
    const NLCSparam  = PluginManager.parameters(pluginName);
    const NLCS_chMag = Number(NLCSparam.chMag) / 100 || 1;
    const NLCS_cwMag = Number(NLCSparam.cwMag) / 100 || 1;
    const NLCS_ahMag = Number(NLCSparam.ahMag) / 100 || 1;
    let   NLCS_awMag = Number(NLCSparam.awMag) / 100 || 1;
    const NLCS_cSmooth = NLCSparam.cSmooth === "true";
    const NLCS_aSmooth = NLCSparam.aSmooth === "true";
    const NLCS_excla   = NLCSparam.excla   === "true";
    const NLCS_noField = NLCSparam.noField === "true";
    const NLCS_vehic   = NLCSparam.vehic   === "true";
    if (NLCS_ahMag / NLCS_awMag === 1.2 || NLCS_awMag / NLCS_ahMag === 1.2) {
        NLCS_awMag -= 0.01;
    } // この倍率だとモーションが乱れる場合がある???

    if (NLCSparam.chara === "true") { // キャラクターサイズ変更
        const _GCB_initMembers = Game_CharacterBase.prototype.initMembers;
        Game_CharacterBase.prototype.initMembers = function() {
            _GCB_initMembers.apply(this, arguments);
            this._scaleX = 100; // CharacterGraphicExtend.js との競合対策
            this._scaleY = 100;
        };

        const _Sprite_Character_update = Sprite_Character.prototype.update;
        Sprite_Character.prototype.update = function() {
            _Sprite_Character_update.apply(this, arguments);
            const c = this._character;
            if (c._NLCSchange && c._scaleX === 100 && c._scaleY === 100
              && !this._customResource) { // CharacterGraphicExtend.jsを優先
                this.scale.x = NLCS_cwMag;
                this.scale.y = NLCS_chMag;
            }
        };

        const _SC_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
        Sprite_Character.prototype.setCharacterBitmap = function() {
            _SC_setCharacterBitmap.apply(this, arguments);
            this.bitmap.smooth = NLCS_cSmooth;
            const name   = this._characterName;
            const isBoat = name === $dataSystem.boat.characterName;
            const isShip = name === $dataSystem.ship.characterName;
            const isAirs = name === $dataSystem.airship.characterName;
            const evaV = NLCS_vehic && (isBoat || isShip || isAirs);
            const eva1 = NLCSparam.cExcFile.indexOf(name) === -1;
            const eva2 = !NLCS_noField ? true : $gameMap.isOverworld() ? evaV : true;
            const eva3 = NLCS_excla ? !this.isObjectCharacter() : true;
            const eva4 = name && !this._character._NLCSchange;
            if (eva1 && eva2 && eva3 && eva4) {
                this._character._NLCSchange = true;
            }
        };

        const _SB_updatePosition = Sprite_Balloon.prototype.updatePosition;
        Sprite_Balloon.prototype.updatePosition = function() { // フキダシアイコン位置補正
            _SB_updatePosition.apply(this, arguments);
            this.y = this._target.y - this._target.height * this._target.scale.y;
        };
    }

    if (NLCSparam.actor === "true") { // 戦闘アクターサイズ変更
        const _SA_updateBitmap = Sprite_Actor.prototype.updateBitmap;
        Sprite_Actor.prototype.updateBitmap = function() {
            const name   = this._actor.battlerName();
            const change = this._battlerName !== name && !this._NLCSsvChange;
            _SA_updateBitmap.apply(this, arguments);
            if (change && NLCSparam.aExcFile.indexOf(name) === -1
              && !this._NLCLcardImageOn) { // NLM_CardLayoutMZ.jsとの競合対策
                this._mainSprite.bitmap.smooth = NLCS_aSmooth;
                this._mainSprite.scale.x   *= NLCS_awMag;
                this._mainSprite.scale.y   *= NLCS_ahMag;
                this._weaponSprite.scale.x *= NLCS_awMag;
                this._weaponSprite.scale.y *= NLCS_ahMag;
                this._stateSprite.scale.x  *= NLCS_awMag;
                this._stateSprite.scale.y  *= NLCS_ahMag;
                if (NLCSparam.shadow === "true") {
                    this._shadowSprite.scale.x *= NLCS_awMag;
                    this._shadowSprite.scale.y *= NLCS_ahMag;
                }
                this._NLCSsvChange = true;
            }
        };
    }
})();
