/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
*   A scene for the keyboard assign setting
*   @extends SceneGame
*   @property {number} [SceneKeyboardAssign.WINDOW_PRESS_WIDTH=300] The window 
*   press width
*   @property {number} [SceneKeyboardAssign.WINDOW_PRESS_HEIGHT=200] The window 
*   press height
*   @property {number} [SceneKeyboardAssign.MAX_WAIT_TIME_FIRST=3000] The max 
*   wait time in milliseconds first
*   @property {number} [SceneKeyboardAssign.MAX_WAIT_TIME=1000] The max wait 
*   time in milliseconds
*   @property {Picture2D} pictureBackground The title screen background picture
*   @property {WindowBox} windowKeyboard The window box used for keyboard
*   @property {WindowBox} windowInformations The window box used for 
*   informations
*   @property {WindowChoices} windowChoicesMain The main window choices
*   @property {WindowBox} windowPress The window box for pressing a new key
*   @property {boolean} showPress Indicate if the HUD should display press box
*   @property {number[][]} currentSC The current pressed shortcut
*   @property {number[]} keysPressed The current key pressed
*   @property {number} compareWait Wait time in milliseconds;
*/
class SceneKeyboardAssign extends SceneGame
{
    static WINDOW_PRESS_WIDTH = 300;
    static WINDOW_PRESS_HEIGHT = 200;
    static MAX_WAIT_TIME_FIRST = 3000;
    static MAX_WAIT_TIME = 1000;

    constructor()
    {
        super();
    }

    // -------------------------------------------------------
    /** Load async stuff
    */
    async load()
    {
        // Creating background
        if (RPM.datasGame.titlescreenGameover.isTitleBackgroundImage)
        {
            this.pictureBackground = await Picture2D.createWithID(RPM.datasGame
                .titlescreenGameover.titleBackgroundImageID, PictureKind
                .TitleScreen);
            this.pictureBackground.cover = true;
        }

        // Creating windows
        this.windowKeyboard = new WindowBox(RPM.HUGE_SPACE, RPM.HUGE_SPACE, RPM
            .MEDIUM_SLOT_WIDTH, RPM.LARGE_SLOT_HEIGHT,
            {
                content: new GraphicText("KEYBOARD", { align: Align.Center }),
                padding: RPM.SMALL_SLOT_PADDING
            }
        );
        this.windowInformations = new WindowBox(RPM.HUGE_SPACE + RPM
            .MEDIUM_SLOT_WIDTH + RPM.LARGE_SPACE, RPM.HUGE_SPACE, RPM.SCREEN_X -
            (2 * RPM.HUGE_SPACE) - RPM.MEDIUM_SLOT_WIDTH - RPM.LARGE_SPACE, RPM
            .LARGE_SLOT_HEIGHT, 
            {
                content: new GraphicText("Select a keyboard shortcut to edit.",
                    { align: Align.Center }),
                padding: RPM.SMALL_SLOT_PADDING
            }
        );
        this.windowChoicesMain = new WindowChoices(RPM.HUGE_SPACE, RPM
            .HUGE_SPACE + RPM.LARGE_SLOT_HEIGHT + RPM.LARGE_SPACE, RPM.SCREEN_X 
            - (2 * RPM.HUGE_SPACE), RPM.MEDIUM_SLOT_HEIGHT, RPM.datasGame
            .keyBoard.getCommandsGraphics(),
            {
                nbItemsMax: 9,
                listCallbacks: RPM.datasGame.keyBoard.getCommandsActions(),
                bordersInsideVisible: false
            }
        );
        this.windowPress = new WindowBox((RPM.SCREEN_X / 2) - (
            SceneKeyboardAssign.WINDOW_PRESS_WIDTH / 2), (RPM.SCREEN_Y / 2) - (
            SceneKeyboardAssign.WINDOW_PRESS_HEIGHT / 2), SceneKeyboardAssign
            .WINDOW_PRESS_WIDTH, SceneKeyboardAssign.WINDOW_PRESS_HEIGHT,
            {
                content: this.windowChoicesMain.getCurrentContent(),
                padding: RPM.DIALOG_PADDING_BOX
            }
        );

        // Initialize
        this.showPress = false;
        this.currentSC = [];
        this.keysPressed = [];
        this.compareWait = SceneKeyboardAssign.MAX_WAIT_TIME_FIRST;
        
        this.loading = false;
    }

    // -------------------------------------------------------
    /** Update the key
    */
    updateKey()
    {
        this.compareWait = SceneKeyboardAssign.MAX_WAIT_TIME_FIRST;
        this.waitTime = new Date().getTime();
        this.showPress = true;
        this.originalSC = this.windowChoicesMain.getCurrentContent().kb.sc;
        this.currentSC = [];
        this.windowChoicesMain.getCurrentContent().updateShort(this
            .currentSC);
        this.nextOR = true;
        return true;
    }

    // -------------------------------------------------------
    /** Update the scene
    */
    update()
    {
        if (this.showPress)
        {
            if (this.keysPressed.length === 0 && new Date().getTime() - this
                .waitTime >= this.compareWait)
            {
                this.showPress = false;

                // If nothing, go back to previous sc
                if (this.currentSC.length === 0)
                {
                    this.windowChoicesMain.getCurrentContent().updateShort(this
                        .originalSC);
                } else {
                    RPM.settings.updateKeyboard(this.windowChoicesMain
                        .getCurrentContent().kb.id, this.currentSC);
                }
                RPM.requestPaintHUD = true;
            }
        }
    }

    // -------------------------------------------------------
    /** Handle scene key pressed
    *   @param {number} key The key ID
    */
    onKeyPressed(key)
    {
        if (this.showPress)
        {
            this.keysPressed.push(key);
            if (this.nextOR)
            {
                this.currentSC.push([]);
                this.nextOR = false;
            }
            let current = this.currentSC[this.currentSC.length - 1];
            if (current.indexOf(key) === -1)
            {
                this.compareWait = SceneKeyboardAssign.MAX_WAIT_TIME_FIRST;
                this.currentSC[this.currentSC.length - 1].push(key);
                this.windowChoicesMain.getCurrentContent().updateShort(this
                    .currentSC);
            }
        } else
        {
            this.windowChoicesMain.onKeyPressed(key, this);
            if (DatasKeyBoard.isKeyEqual(key, RPM.datasGame.keyBoard
                .menuControls.Cancel) || DatasKeyBoard.isKeyEqual(key, RPM
                .datasGame.keyBoard.MainMenu))
            {
                RPM.datasGame.system.soundCancel.playSound();
                RPM.gameStack.pop();
            }
        }
    }

    // -------------------------------------------------------
    /** Handle scene key released
    *   @param {number} key The key ID
    */
    onKeyReleased(key)
    {
        this.keysPressed.splice(this.keysPressed.indexOf(key), 1);
        if (this.keysPressed.length === 0 && this.currentSC.length > 0)
        {
            this.compareWait = SceneKeyboardAssign.MAX_WAIT_TIME;
            this.nextOR = true;
            this.waitTime = new Date().getTime();
        }
    }

    // -------------------------------------------------------
    /** Handle scene pressed and repeat key
    *   @param {number} key The key ID
    *   @returns {boolean}
    */
    onKeyPressedAndRepeat(key)
    {
        if (!this.showPress)
        {
            this.windowChoicesMain.onKeyPressedAndRepeat(key);
            this.windowPress.content = this.windowChoicesMain.getCurrentContent();
        }
    }

    // -------------------------------------------------------
    /** Draw the HUD scene
    */
    drawHUD()
    {
        if (RPM.datasGame.titlescreenGameover.isTitleBackgroundImage)
        {
            this.pictureBackground.draw();
        }
        this.windowKeyboard.draw();
        this.windowInformations.draw();
        this.windowChoicesMain.draw();
        if (this.showPress)
        {
            this.windowPress.draw();
        }
    }
}
