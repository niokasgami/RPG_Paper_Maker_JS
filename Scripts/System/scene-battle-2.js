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
//  Step 2 :
//      SubStep 0 : Animation user + animation sprite
//      SubStep 1 : Animation target
//      SubStep 2 : Damages
//
// -------------------------------------------------------

// -------------------------------------------------------
/** Initialize step
*/
SceneBattle.prototype.initializeStep2 = function()
{
    let informationText, content;
    switch (this.battleCommandKind)
    {
    case EffectSpecialActionKind.ApplyWeapons:
        informationText = this.attackSkill.name();
        break;
    case EffectSpecialActionKind.OpenSkills:
        content = this.attackingGroup === CharacterKind.Hero ? this
            .windowChoicesSkills.getCurrentContent().skill : RPM.datasGame
            .skills.list[this.action.skillID.getValue()];
        informationText = content.name();
        break;
    case EffectSpecialActionKind.OpenItems:
        content = this.attackingGroup === CharacterKind.Hero ? this
            .windowChoicesItems.getCurrentContent().item : RPM.datasGame.items
            .list[this.action.itemID.getValue()];
        informationText = content.name();
        break;
    default:
        informationText = RPM.STRING_EMPTY;
        break;
    }
    this.windowTopInformations.content = new GraphicText(informationText, {
        align: Align.Center });
    this.time = new Date().getTime();
    this.damages = [];
    this.effects = [];
    this.frameUser = 0;
    this.frameTarget = 0;
    let i, l;
    switch (this.battleCommandKind)
    {
    case EffectSpecialActionKind.ApplyWeapons:
        if (this.attackingGroup === CharacterKind.Hero)
        {
            let equipments = this.user.character.equip;
            let j, m, gameItem, weapon;
            for (i = 0, l = equipments.length; i < l; i++)
            {
                gameItem = equipments[i];
                if (gameItem && gameItem.k === ItemKind.Weapon)
                {
                    weapon = gameItem.getItemInformations();
                    this.userAnimation = RPM.datasGame.animations.list[weapon
                        .animationUserID.getValue()];
                    this.targetAnimation = RPM.datasGame.animations.list[weapon
                        .animationTargetID.getValue()];
                    for (j = 0, m = weapon.effects.length; j < m; j++)
                    {
                        this.effects.push(weapon.effects[j]);
                    }
                }
            }
        }
        if (this.effects.length === 0)
        {
            this.userAnimation = RPM.datasGame.animations.list[RPM.datasGame
                .skills.list[1].animationUserID.getValue()];
            this.targetAnimation = RPM.datasGame.animations.list[RPM.datasGame
                .skills.list[1].animationTargetID.getValue()];
            let effects = this.attackSkill.effects;
            for (i = 1, l = effects.length; i < l; i++)
            {
                this.effects.push(effects[i]);
            }
        }
        this.user.setAttacking();
        break;
    case EffectSpecialActionKind.OpenSkills:
        this.userAnimation = RPM.datasGame.animations.list[content
            .animationUserID.getValue()];
        this.targetAnimation = RPM.datasGame.animations.list[content
            .animationTargetID.getValue()];
        this.effects = content.effects;
        content.cost();
        this.user.setUsingSkill();
        break;
    case EffectSpecialActionKind.OpenItems:
        let graphic = this.windowChoicesItems.getCurrentContent();
        this.userAnimation = RPM.datasGame.animations.list[content
            .animationUserID.getValue()];
        this.targetAnimation = RPM.datasGame.animations.list[content
            .animationTargetID.getValue()];
        this.effects = content.effects;
        if (this.attackingGroup === CharacterKind.Hero)
        {
            RPM.game.useItem(graphic.gameItem);
        }
        this.user.setUsingItem();
        break;
    case EffectSpecialActionKind.EndTurn:
        this.time -= SceneBattle.TIME_ACTION_ANIMATION;
        let user;
        for (i = 0, l = this.battlers[CharacterKind.Hero].length; i < l; i++)
        {
            user = this.battlers[CharacterKind.Hero][i];
            user.setActive(false);
            user.setSelected(false);
        }
        this.subStep = 2;
        break;
    case EffectSpecialActionKind.DoNothing:
        this.time -= SceneBattle.TIME_ACTION_ANIMATION;
        this.subStep = 2;
        break;
    }
    this.currentEffectIndex = 0;
    if (this.effects.length > 0)
    {
        this.effects[this.currentEffectIndex].execute();
    }
    if (this.userAnimation)
    {
        this.userAnimationPicture = this.userAnimation.createPicture();
    }
    if (this.targetAnimation)
    {
        this.targetAnimationPicture = this.targetAnimation.createPicture();
    }
}

// -------------------------------------------------------
/** Get the animation efect condition kind
*   @returns {AnimationEffectConditionKind}
*/
SceneBattle.prototype.getCondition = function()
{
    if (this.damages[0])
    {
        if (this.damages[0][1])
        {
            return AnimationEffectConditionKind.Critical;
        }
        if (this.damages[0][2])
        {
            return AnimationEffectConditionKind.Miss;
        }
    }
    return AnimationEffectConditionKind.Hit;
}

// -------------------------------------------------------
/** Update the battle
*/
SceneBattle.prototype.updateStep2 = function()
{
    let i, l;
    switch (this.subStep)
    {
    case 0: // Animation user
        // Before animation, wait for enemy moving
        if (this.user.moving)
        {
            return;
        }

        // User animation if exists
        if (this.userAnimation)
        {
            this.frameUser++;
            this.userAnimation.playSounds(this.frameUser, this.getCondition());
            RPM.requestPaintHUD = true;
        }

        // Test if animation finished
        if ((!this.userAnimation || this.frameUser > this.userAnimation.frames
            .length) && !this.user.isAttacking())
        {
            if (!this.targetAnimation)
            {
                this.time = new Date().getTime() - (SceneBattle
                    .TIME_ACTION_ANIMATION / 2);
                for (i = 0, l = this.targets.length; i < l; i++)
                {
                    this.targets[i].timeDamage = 0;
                }
                this.subStep = 2;
            } else
            {
                this.subStep = 1;
            }
        }
        break;
    case 1: // Animation target
        // Target animation if exists
        this.frameTarget++;
        this.targetAnimation.playSounds(this.frameTarget, this.getCondition());
        RPM.requestPaintHUD = true;
        if (this.frameTarget > this.targetAnimation.frames.length)
        {
            this.time = new Date().getTime() - (SceneBattle
                .TIME_ACTION_ANIMATION / 2);
            for (i = 0, l = this.targets.length; i < l; i++)
            {
                this.targets[i].timeDamage = 0;
            }
            this.subStep = 2;
        }
        break;
    case 2: // Damages
        // If calling a common reaction, wait for it to be finished
        if (this.reactionInterpreters.length > 0)
        {
            for (i = 0, l = this.targets.length; i < l; i++)
            {
                this.targets[i].timeDamage = 0;
            }
            return;
        }
        if ((new Date().getTime() - this.time) >= SceneBattle
            .TIME_ACTION_ANIMATION)
        {
            let damage;
            for (i = 0, l = this.targets.length; i < l; i++)
            {
                damage = this.damages[i];
                if (damage)
                {
                    this.targets[i].updateDead(damage[0] > 0 && !damage[1], this
                        .user);
                }
            }
            RPM.requestPaintHUD = true;

            // Target and user test death
            this.user.updateDead(false);
            for (i = 0, l = this.targets.length; i < l; i++)
            {
                this.targets[i].updateDead(false);
            }

            // Testing end of battle
            let effect, isAnotherEffect;
            if (this.isWin())
            {
                this.winning = true;
                this.activeGroup();
                this.changeStep(4);
            } else if (this.isLose())
            {
                this.winning = false;
                this.changeStep(4);
            } else
            {
                effect = this.effects[this.currentEffectIndex];
                this.currentEffectIndex++;
                for (l = this.effects.length; this.currentEffectIndex < l; this
                    .currentEffectIndex++)
                {
                    this.targets = this.tempTargets;
                    effect = this.effects[this.currentEffectIndex];
                    effect.execute();
                    if (effect.isAnimated())
                    {
                        break;
                    }
                }
                isAnotherEffect = this.currentEffectIndex < this.effects.length;
                if (isAnotherEffect)
                {
                    this.time = new Date().getTime() - (SceneBattle
                        .TIME_ACTION_ANIMATION / 2);
                    for (let j = 0, ll = this.targets.length; j < ll; j++)
                    {
                        this.targets[j].timeDamage = 0;
                    }
                    return;
                } else
                {
                    this.user.setActive(false);
                    this.user.setSelected(false);
                }

                // Testing end of turn
                if (this.isEndTurn())
                {
                    this.activeGroup();
                    if (this.attackingGroup === CharacterKind.Hero)
                    {
                        this.changeStep(3); // Attack of ennemies
                    } else
                    {
                        this.turn++;
                        this.changeStep(1); // Attack of heroes
                    }
                } else
                {
                    if (this.attackingGroup === CharacterKind.Hero)
                    {
                        this.changeStep(1); // Attack of heroes
                    } else
                    {
                        this.changeStep(3); // Attack of ennemies
                    }
                }
            }
        }
        break;
    }
}

// -------------------------------------------------------
/** Handle key pressed
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedStep2 = function(key){

}

// -------------------------------------------------------
/** Handle key released
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyReleasedStep2 = function(key){

}

// -------------------------------------------------------
/** Handle key repeat pressed
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedRepeatStep2 = function(key){

}

// -------------------------------------------------------
/** Handle key pressed and repeat
*   @param {number} key The key ID 
*/
SceneBattle.prototype.onKeyPressedAndRepeatStep2 = function(key){

}

// -------------------------------------------------------
/** Draw the battle HUD
*/
SceneBattle.prototype.drawHUDStep2 = function()
{
    this.windowTopInformations.draw();

    // Draw animations
    if (this.userAnimation)
    {
        this.userAnimation.draw(this.userAnimationPicture, this.frameUser, this
            .user);
    }
    let i, l;
    if (this.targetAnimation)
    {
        if (this.targetAnimation.positionKind === AnimationPositionKind
            .ScreenCenter)
        {
            this.targetAnimation.draw(this.targetAnimationPicture, this
                .frameTarget, null);
        } else
        {
            for (i = 0, l = this.targets.length; i < l; i++)
            {
                this.targetAnimation.draw(this.targetAnimationPicture, this
                    .frameTarget, this.targets[i]);
            }
        }
    }

    // Draw damages
    if (this.reactionInterpreters.length === 0 && !this.user.isAttacking() && (
        !this.targetAnimation || this.frameTarget > this.targetAnimation.frames
        .length))
    {
        let damage;
        for (i = 0, l = this.damages.length; i < l; i++)
        {
            damage = this.damages[i];
            this.targets[i].drawDamages(damage[0], damage[1], damage[2]);
        }
    }
}
