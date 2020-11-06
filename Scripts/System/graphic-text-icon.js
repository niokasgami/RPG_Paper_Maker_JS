/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
*   The graphic displaying a text and an icon
*   @property {string} text The brut text to display
*   @property {number} iconID The icon ID
*   @property {Align} side The side to display icon
*   @property {Align} align The complete graphic align
*   @property {number} space The space between icon and text
*   @property {Picture2D} graphicIcon The picture 2D icon
*   @property {GraphicText} graphicText The graphic text
*   @property {number} length The text length
*   @param {string} text The brut text to display
*   @param {number} iconID The icon ID
*   @param {Object} [opts={}] Options
*   @param {Align} [opts.side=Align.Left] The side to display icon
*   @param {Align} [opts.align=Align.left] The complete graphic align
*   @param {number} [opts.space=Rpm.MEDIUM_SPACE] The space between icon and
*   text
*/
class GraphicTextIcon
{
    constructor(text, iconID, { side = Align.Left, align = Align.Left, space = 
        RPM.MEDIUM_SPACE } = {})
    {
        this.text = text;
        this.iconID = iconID;
        this.side = side;
        this.align = align;
        this.space = space;
        this.graphicIcon = RPM.datasGame.pictures.getPictureCopy(PictureKind
            .Icons, this.iconID);
        this.graphicText = new GraphicText(this.text);
        Platform.ctx.font = this.graphicText.font;
        this.graphicText.updateContextFont();
        this.length = Platform.ctx.measureText(this.text).width;
    }

    // -------------------------------------------------------
    /** Get the max possible height
    *   @returns {number}
    */
    getMaxHeight()
    {
        return Math.max(this.graphicText.fontSize, this.graphicIcon.oH);
    }

    // -------------------------------------------------------
    /** Get the width
    *   @returns {number}
    */
    getWidth()
    {
        return this.graphicIcon.oW + this.space + this.length;
    }

    // -------------------------------------------------------
    /** Drawing the content
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawChoice(x, y, w, h)
    {
        let iconWidth = this.graphicIcon.oW;
        let iconHeight = this.graphicIcon.oH;

        // Align offset
        let offset;
        switch (this.align)
        {
        case Align.Left:
            offset = 0;
            break;
        case Align.Right:
            offset = w - this.getWidth();
            break;
        case Align.Center:
            offset = (w - this.getWidth()) / 2;
            break;
        }

        // Draw according to side
        if (this.side === Align.Left)
        {
            this.graphicIcon.draw(x + offset, y - (iconHeight / 2) + (h / 2));
            offset += iconWidth + this.space;
            this.graphicText.draw(x + offset, y, w, h);
        } else if (this.side === Align.Right)
        {
            this.graphicText.draw(x + offset, y, w, h);
            offset += this.length + this.space;
            this.graphicIcon.draw(x + offset, y - (iconHeight / 2) + (h / 2));
        }
    }

    // -------------------------------------------------------
    /** Drawing the content
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawBox(x, y, w, h)
    {
        this.drawChoice(x, y, w, h);
    }

    // -------------------------------------------------------
    /** Drawing the content
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    draw(x, y, w, h)
    {
        this.drawChoice(x, y, w, h);
    }
}