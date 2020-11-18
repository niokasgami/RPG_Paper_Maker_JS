/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

// -------------------------------------------------------
//
//  CLASS SceneBattle
//
//  Step 1 :
//      SubStep 0 : Selection of an ally
//      SubStep 1 : Selection of a command
//      SubStep 2 : selection of an ally/enemy for a command
//
// -------------------------------------------------------

// -------------------------------------------------------
/** Initialize step
*/
SceneBattle.prototype.initializeStep1 = function() 
{
    // Check if everyone is dead to avoid infinite looping
    if (this.isLose())
    {
        this.winning = false;
        this.changeStep(4);
        return;
    }
    this.battleCommandKind = EffectSpecialActionKind.None;
    this.windowTopInformations.content = new GraphicText("Select an ally", {
        align: Align.Center });
    this.selectedUserIndex = this.selectFirstIndex(CharacterKind.Hero, 0);
    this.kindSelection = CharacterKind.Hero;
    this.attackingGroup = CharacterKind.Hero;
    this.userTarget = false;
    this.all = false;
    this.targets = [];
    this.moveArrow();
    this.battlers[this.kindSelection][this.selectedUserTargetIndex()]
        .updateArrowPosition(this.camera);
    this.listSkills = [];
    this.listItems = [];

    // Items
    let ownedItem, item;
    for (let i = 0, l = RPM.game.items.length; i < l; i++)
    {
        ownedItem = RPM.game.items[i];
        item = RPM.datasGame.items.list[ownedItem.id];
        if (ownedItem.k === ItemKind.Item && item.consumable && (item
            .avaialableKind === AvailableKind.Battle || item.availableKind ===
            AvailableKind.Always))
        {
            this.listItems.push(new GraphicItem(ownedItem));
        }
    }
    this.windowChoicesItems.setContentsCallbacks(this.listItems);
    this.windowItemDescription.content = this.windowChoicesItems
        .getCurrentContent();
}

// -------------------------------------------------------
/** Register the last command index and offset in the user
*/
SceneBattle.prototype.registerLastCommandIndex = function()
{
    this.user.lastCommandIndex = this.windowChoicesBattleCommands
        .currentSelectedIndex;
    this.user.lastCommandOffset = this.windowChoicesBattleCommands
        .offsetSelectedIndex;
}

// -------------------------------------------------------
/** Register the laster skill index and offset in the user
*/
SceneBattle.prototype.registerLastSkillIndex = function()
{
    this.user.lastSkillIndex = this.windowChoicesSkills.currentSelectedIndex;
    this.user.lastSkillOffset = this.windowChoicesSkills.offsetSelectedIndex;
}

// -------------------------------------------------------
/** Register the last item index and offset in the user
*/
SceneBattle.prototype.registerLastItemIndex = function()
{
    this.user.lastItemIndex = this.windowChoicesItems.currentSelectedIndex;
    this.user.lastItemOffset = this.windowChoicesItems.offsetSelectedIndex;
}

// -------------------------------------------------------
/** Select a target
*   @param {TargetKind} targetKind The target kind 
*/
SceneBattle.prototype.selectTarget = function(targetKind)
{
    this.subStep = 2;
    switch (targetKind)
    {
    case TargetKind.User:
        this.kindSelection = CharacterKind.Hero;
        this.userTarget = true;
        this.selectedTargetIndex = this.battlers[this.kindSelection].indexOf(
            this.user);
        break;
    case TargetKind.Enemy:
        this.kindSelection = CharacterKind.Monster;
        break;
    case TargetKind.Ally:
        this.kindSelection = CharacterKind.Hero;
        break;
    case TargetKind.AllEnemies:
        this.kindSelection = CharacterKind.Monster;
        this.all = true;
        break;
    case TargetKind.AllAllies:
        this.kindSelection = CharacterKind.Hero;
        this.all = true;
        break;
    }
    this.selectedUserIndex = this.selectFirstIndex(CharacterKind.Hero, this
        .selectedUserIndex);
    if (!this.userTarget)
    {
        this.selectedTargetIndex = this.selectFirstIndex(this.kindSelection, 0);
    }
    this.moveArrow();
}

// -------------------------------------------------------
/** Select the first index according to target kind
*   @param {TargetKind} kind The target kind
*   @param {number} index The index (last registered)
*/
SceneBattle.prototype.selectFirstIndex = function(kind, index)
{
    while (!this.isDefined(kind, index))
    {
        if (index < (this.battlers[kind].length - 1))
        {
            index++;
        } else if (index === (this.battlers[kind].length - 1))
        {
            index = 0;
        }
    }
    RPM.datasGame.system.soundCursor.playSound();
    return index;
}

// -------------------------------------------------------
/** Get the index of the array after going up
*   @returns {number}
*/
SceneBattle.prototype.indexArrowUp = function()
{
    let index = this.selectedUserTargetIndex();
    do
    {
        if (index > 0)
        {
            index--;
        }
        else if (index === 0)
        {
            index = this.battlers[this.kindSelection].length - 1;
        }
    } while (!this.isDefined(this.kindSelection, index, this.subStep === 2));
    return index;
}

// -------------------------------------------------------
/** Get the index of the array after going down
*   @returns {number}
*/
SceneBattle.prototype.indexArrowDown = function()
{
    let index = this.selectedUserTargetIndex();
    do
    {
        if (index < (this.battlers[this.kindSelection].length - 1))
        {
            index++;
        } else if (index === (this.battlers[this.kindSelection].length - 1))
        {
            index = 0;
        }
    } while (!this.isDefined(this.kindSelection, index, this.subStep === 2));
    return index;
}

// -------------------------------------------------------
/** Move the arrow
*/
SceneBattle.prototype.moveArrow = function()
{
    // Updating window informations
    let window = this.subStep === 2 ? this.windowTargetInformations : this
        .windowUserInformations;
    let graphics = this.graphicPlayers[this.kindSelection][this
        .selectedUserTargetIndex()];
    window.content = this.subStep === 2 ? graphics.target : graphics.user;
    window.content.update();
    RPM.requestPaintHUD = true;
}

// -------------------------------------------------------
/** Get the index of the target
*   @returns {number}
*/
SceneBattle.prototype.selectedUserTargetIndex = function()
{
    return (this.subStep === 2) ? this.selectedTargetIndex : this
        .selectedUserIndex;
}

// -------------------------------------------------------
/** When an ally is selected
*/
SceneBattle.prototype.onAllySelected = function()
{
    this.subStep = 1;
    this.user = this.battlers[CharacterKind.Hero][this.selectedUserIndex];
    this.user.setSelected(true);
    this.windowChoicesBattleCommands.unselect();
    this.windowChoicesBattleCommands.select(this.user.lastCommandIndex);
    this.windowChoicesBattleCommands.offsetSelectedIndex = this.user
        .lastCommandOffset;

    // Update skills list
    let skills = this.user.character.sk;
    this.listSkills = [];
    let ownedSkill, availableKind;
    for (let i = 0, l = skills.length; i < l; i++)
    {
        ownedSkill = skills[i];
        availableKind = RPM.datasGame.skills.list[ownedSkill.id]
            .availableKind;
        if (availableKind === AvailableKind.Always || availableKind === 
            AvailableKind.Battle)
        {
            this.listSkills.push(new GraphicSkill(ownedSkill));
        }
    }
    this.windowChoicesSkills.setContentsCallbacks(this.listSkills);
    this.windowSkillDescription.content = this.windowChoicesSkills
        .getCurrentContent();
    this.windowChoicesSkills.unselect();
    this.windowChoicesSkills.offsetSelectedIndex = this.user.lastSkillOffset;
    this.windowChoicesSkills.select(this.user.lastSkillIndex);
    this.windowChoicesItems.unselect();
    this.windowChoicesItems.offsetSelectedIndex = this.user.lastItemOffset;
    this.windowChoicesItems.select(this.user.lastItemIndex);
    RPM.requestPaintHUD = true;
}

// -------------------------------------------------------
/** When an ally is unselected
*/
SceneBattle.prototype.onAllyUnselected = function()
{
    switch (this.battleCommandKind)
    {
    case EffectSpecialActionKind.OpenSkills:
        this.registerLastSkillIndex();
        break;
    case EffectSpecialActionKind.OpenItems:
        this.registerLastItemIndex();
        break;
    default:
        this.subStep = 0;
        this.user.setSelected(false);
        this.registerLastCommandIndex();
        break;
    }
    this.battleCommandKind = EffectSpecialActionKind.None;
}

// -------------------------------------------------------
/** When a command is selected
*   @param {number} key The key pressed ID
*/
SceneBattle.prototype.onCommandSelected = function(key)
{
    switch (this.battleCommandKind)
    {
    case EffectSpecialActionKind.OpenSkills:
        if (this.windowChoicesSkills.getCurrentContent().skill.isPossible())
        {
            this.selectTarget(this.windowSkillDescription.content.skill
                .targetKind);
            this.registerLastSkillIndex();
        }
        return;
    case EffectSpecialActionKind.OpenItems:
        this.selectTarget(this.windowItemDescription.content.item.targetKind);
        this.registerLastItemIndex();
        return;
    default:
        break;
    }
    this.windowChoicesBattleCommands.onKeyPressed(key, this
        .windowChoicesBattleCommands.getCurrentContent().skill);
    let i, l;
    switch (this.battleCommandKind)
    {
    case EffectSpecialActionKind.ApplyWeapons:
        // Check weapon targetKind
        this.attackSkill = this.windowChoicesBattleCommands.getCurrentContent()
            .skill;
        let targetKind = null;
        let equipments = this.user.character.equip;
        let gameItem;
        for (i = 0, l = equipments.length; i < l; i++)
        {
            gameItem = equipments[i];
            if (gameItem && gameItem.k === ItemKind.Weapon)
            {
                targetKind = gameItem.getItemInformations().targetKind;
                break;
            }
        }
        // If no weapon
        if (targetKind === null)
        {
            targetKind = this.attackSkill.targetKind;
        }
        this.selectTarget(targetKind);
        break;
    case EffectSpecialActionKind.OpenSkills:
        if (this.listSkills.length === 0)
        {
            this.battleCommandKind = EffectSpecialActionKind.None;
        }
        break;
    case EffectSpecialActionKind.OpenItems:
        if (this.listItems.length === 0)
        {
            this.battleCommandKind = EffectSpecialActionKind.None;
        }
        break;
    case EffectSpecialActionKind.Escape:
        if (this.canEscape)
        {
            this.step = 4;
            this.subStep = 3;
            this.transitionEnded = false;
            this.time = new Date().getTime();
            this.winning = true;
            RPM.escaped = true;
            RPM.songsManager.initializeProgressionMusic(PlaySong
                .currentPlayingMusic.volume, 0, 0, SceneBattle
                .TIME_LINEAR_MUSIC_END);
            for (i = 0, l = this.battlers[CharacterKind.Hero].length; i < l; i++) 
            {
                this.battlers[CharacterKind.Hero][i].setEscaping();
            }
        }
        return;
    case EffectSpecialActionKind.EndTurn:
        this.windowChoicesBattleCommands.unselect();
        this.changeStep(2);
        return;
    default:
        break;
    }
    this.registerLastCommandIndex();
}

// -------------------------------------------------------
/** When targets are selected
*/
SceneBattle.prototype.onTargetsSelected = function()
{
    if (this.all)
    {
        for (let i = 0, l = this.battlers[this.kindSelection].length; i < l; i++)
        {
            this.targets.push(this.battlers[this.kindSelection][i]);
        }
    } else
    {
        this.targets.push(this.battlers[this.kindSelection][this
            .selectedUserTargetIndex()]);
    }
    this.windowChoicesBattleCommands.unselect();
    this.changeStep(2);
}

// -------------------------------------------------------
/** When targets are unselected
*/
SceneBattle.prototype.onTargetsUnselected = function()
{
    this.subStep = 1;
    this.kindSelection = CharacterKind.Hero;
    this.userTarget = false;
    this.all = false;
    this.moveArrow();
}

// -------------------------------------------------------
/** Update the battle
*/
SceneBattle.prototype.updateStep1 = function() {

}

// -------------------------------------------------------
/** Handle key pressed
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedStep1 = function(key) {
    switch (this.subStep)
    {
    case 0:
        if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
            .Action))
        {
            RPM.datasGame.system.soundConfirmation.playSound();
            this.onAllySelected();
        }
        break;
    case 1:
        if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
            .Action))
        {
            this.onCommandSelected(key);
        } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
            .menuControls.Cancel))
        {
            RPM.datasGame.system.soundCancel.playSound();
            this.onAllyUnselected();
        }
        break;
    case 2:
        if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard.menuControls
            .Action))
        {
            RPM.datasGame.system.soundConfirmation.playSound();
            this.onTargetsSelected();
        } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
            .menuControls.Cancel))
        {
            RPM.datasGame.system.soundCancel.playSound();
            this.onTargetsUnselected();
        }
        break;
    }
}

// -------------------------------------------------------
/** Handle key released
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyReleasedStep1 = function(key){

}

// -------------------------------------------------------
/** Handle key repeat pressed
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedRepeatStep1 = function(key){

}

// -------------------------------------------------------
/** Handle key pressed and repeat
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedAndRepeatStep1 = function(key){
    var index = this.selectedUserTargetIndex();
    switch (this.subStep)
    {
    case 0:
    case 2:
        if (!this.userTarget)
        {
            if (DatasKeyBoard.isKeyEqual(key,RPM.datasGame.keyBoard.menuControls
                .Up) || DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
                .menuControls.Left))
            {
                index = this.indexArrowUp();
            } else if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
                .menuControls.Down) || DatasKeyBoard.isKeyEqual(key, RPM
                .datasGame.keyBoard.menuControls.Right))
            {
                index = this.indexArrowDown();
            }
        }
        if (this.subStep === 0)
        {
            if (this.selectedUserIndex !== index)
            {
                RPM.datasGame.system.soundCursor.playSound();
            }
            this.selectedUserIndex = index;
        } else
        {
            if (this.selectedUserIndex !== index)
            {
                RPM.datasGame.system.soundCursor.playSound();
            }
            this.selectedTargetIndex = index;
        }
        this.moveArrow();
        break;
    case 1:
        switch (this.battleCommandKind)
        {
        case EffectSpecialActionKind.OpenSkills:
            this.windowChoicesSkills.onKeyPressedAndRepeat(key);
            this.windowSkillDescription.content = this.windowChoicesSkills
                .getCurrentContent();
            break;
        case EffectSpecialActionKind.OpenItems:
            this.windowChoicesItems.onKeyPressedAndRepeat(key);
            this.windowItemDescription.content = this.windowChoicesItems
                .getCurrentContent();
            break;
        default:
            this.windowChoicesBattleCommands.onKeyPressedAndRepeat(key);
            break;
        }
        break;
    }
}

// -------------------------------------------------------
/** Draw the battle HUD
*/
SceneBattle.prototype.drawHUDStep1 = function()
{
    this.windowTopInformations.draw();

    // Draw heroes window informations
    this.windowUserInformations.draw();
    if (this.subStep === 2)
    {
        this.windowTargetInformations.draw();
    }

    // Arrows
    if (this.all)
    {
        for (let i = 0, l = this.battlers[this.kindSelection].length; i < l; i++)
        {
            this.battlers[this.kindSelection][i].drawArrow();
        }
    } else
    {
        this.battlers[this.kindSelection][this.selectedUserTargetIndex()]
            .drawArrow();
    }
    // Commands
    if (this.subStep === 1)
    {
        this.windowChoicesBattleCommands.draw();
        switch (this.battleCommandKind)
        {
        case EffectSpecialActionKind.OpenSkills:
            this.windowChoicesSkills.draw();
            this.windowSkillDescription.draw();
            break;
        case EffectSpecialActionKind.OpenItems:
            this.windowChoicesItems.draw();
            this.windowItemDescription.draw();
            break;
        }
    }
}
