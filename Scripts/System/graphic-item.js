/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
*   The graphic displaying all the items information in the inventory menu
*   @property {GameItem} gameItem The current selected item
*   @property {GraphicText} graphicName The item name graphic
*   @property {GraphicText} graphicNb The item numbers graphic
*   @param {GameItem} gameItem The current selected item
*   @param {number} nbItem The number of occurence of the selected item
*/
class GraphicItem
{
    constructor(gameItem, nbItem)
    {
        this.gameItem = gameItem;
        this.item = this.gameItem.getItemInformations();

        // All the graphics
        this.graphicName = new GraphicTextIcon(this.item.name(), this.item
            .pictureID);
        this.graphicNb = new GraphicText("x" + (RPM.isUndefined(nbItem) ? this
            .gameItem.nb : nbItem), { align: Align.Right });
        this.graphicInformations = new GraphicSkillItem(this.item);
    }

    // -------------------------------------------------------
    /** Update the game item number
    */
    updateNb()
    {
        this.graphicNb.setText("x" + this.gameItem.nb);
    }

    // -------------------------------------------------------
    /** Drawing the item in choice box
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawChoice(x, y, w, h)
    {
        this.graphicName.draw(x, y, w, h);
        this.graphicNb.draw(x, y, w, h);
    }

    // -------------------------------------------------------
    /** Drawing the item description
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawBox(x, y, w, h)
    {
        this.graphicInformations.drawBox(x, y, w, h);
        this.graphicNb.draw(x, y, w, 0);
    }
}