/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
*   A class for message show text command
*   @extends Bitmap
*   @property {string} message The complete text to parse
*   @property {Picture2D} faceset The faceset picture
*   @property {Bitmap[]} graphics All the graphics
*   @property {number[]} positions All the positions according to graphics
*   @property {Tree} tree The text tree parsing
*/
class GraphicMessage extends Bitmap
{
    constructor(message, facesetID)
    {
        super();

        this.message = message;
        this.faceset = RPM.datasGame.pictures.getPictureCopy(PictureKind
            .Facesets, facesetID);
        this.graphics = [];
        this.positions = [];
        this.setMessage(this.message);
    }

    // -------------------------------------------------------
    /** Set message (parse)
    *   @param {string} message The message to parse
    */
    setMessage(message)
    {
        this.tree = new Tree(null);
        let root = this.tree.root;
        let currentNode = root;
        let lastC = 0;
        let notClosed = [];
        let c, l, ch, open, cr, tag, tagKind, split;
        for (c = 0, l = message.length; c < l; c++)
        {
            ch = message.charAt(c);
            if (ch === RPM.STRING_NEW_LINE)
            {
                // If text before..
                if (c > lastC)
                {
                    currentNode = this.updateTag(currentNode, TagKind.Text, 
                        message.substring(lastC, c), true, notClosed);
                }
                lastC = c + 1;
                currentNode = this.updateTag(currentNode, TagKind.NewLine, null,
                    true, notClosed);
            } else if (ch === RPM.STRING_BRACKET_LEFT)
            {
                open = message.charAt(c + 1) !== RPM.STRING_SLASH;

                // If text before..
                if (c > lastC)
                {
                    currentNode = this.updateTag(currentNode, TagKind.Text, 
                        message.substring(lastC, c), true, notClosed);
                }
                cr = c;
                do
                {
                    cr++;
                    ch = message.charAt(cr);
                } while (cr < l && ch !== RPM.STRING_BRACKET_RIGHT);
                tag = message.substring(c + (open ? 1 : 2), cr);
                if (tag === RPM.TAG_BOLD)
                {
                    tagKind = TagKind.Bold;
                } else if (tag === RPM.TAG_ITALIC)
                {
                    tagKind = TagKind.Italic;
                } else if (tag === RPM.TAG_LEFT)
                {
                    tagKind = TagKind.Left;
                } else if (tag === RPM.TAG_CENTER)
                {
                    tagKind = TagKind.Center;
                } else if (tag === RPM.TAG_RIGHT)
                {
                    tagKind = TagKind.Right;
                } else if (tag.includes(RPM.TAG_SIZE))
                {
                    tagKind = TagKind.Size;
                } else if (tag.includes(RPM.TAG_FONT))
                {
                    tagKind = TagKind.Font;
                } else if (tag.includes(RPM.TAG_TEXT_COLOR))
                {
                    tagKind = TagKind.TextColor;
                } else if (tag.includes(RPM.TAG_BACK_COLOR))
                {
                    tagKind = TagKind.BackColor;
                } else if (tag.includes(RPM.TAG_STROKE_COLOR))
                {
                    tagKind = TagKind.StrokeColor;
                } else if (tag.includes(RPM.TAG_VARIABLE))
                {
                    tagKind = TagKind.Variable;
                } else if (tag.includes(RPM.TAG_PARAMETER))
                {
                    tagKind = TagKind.Parameter;
                } else if (tag.includes(RPM.TAG_PROPERTY))
                {
                    tagKind = TagKind.Property;
                } else if (tag.includes(RPM.TAG_HERO_NAME))
                {
                    tagKind = TagKind.HeroName;
                } else if (tag.includes(RPM.TAG_ICON))
                {
                    tagKind = TagKind.Icon;
                } else
                {
                    tagKind = TagKind.Text;
                }
                if (tagKind === TagKind.Text)
                {
                    currentNode = this.updateTag(currentNode, TagKind.Text, 
                        message.substring(c, cr + 1), true, notClosed);
                } else
                {
                    split = tag.split(RPM.STRING_EQUAL);
                    currentNode = this.updateTag(currentNode, tagKind, open && 
                        split.length > 1 ? parseInt(split[1]) : null, open, 
                        notClosed);
                }
                lastC = cr + 1;
                c = cr;
            }
        }
        if (l === 0 || c > lastC)
        {
            currentNode = this.updateTag(currentNode, TagKind.Text, message
                .substring(lastC, c), true, notClosed);
        }
    }
    
    // -------------------------------------------------------
    /** Update tag
    *   @param {Node} currentNode The current node
    *   @param {TagKind} tag The tag kind
    *   @param {string} value The name 
    *   @param {boolean} open Indicate if open tag
    *   @param {Node[]} notClosed List of unclosed nodes
    *   @returns {Node} 
    */
    updateTag(currentNode, tag, value, open, notClosed)
    {
        if (open)
        {
            for (let i = notClosed.length - 1; i >= 0; i--)
            {
                currentNode = currentNode.add(notClosed[i]);
                notClosed.splice(i, 1);
            }
            switch (tag)
            {
            case TagKind.Variable:
            case TagKind.HeroName:
                value = DynamicValue.createVariable(value);
                break;
            case TagKind.Parameter:
                value = DynamicValue.createParameter(value);
                break;
            case TagKind.Property:
                value = DynamicValue.createProperty(value);
                break;
            }
            currentNode.add([tag, value]);
            if (tag !== TagKind.Text && tag !== TagKind.NewLine && tag !== 
                TagKind.Variable && tag !== TagKind.Icon && tag !== TagKind
                .Property && tag !== TagKind.Parameter && tag !== TagKind
                .HeroName)
            {
                currentNode = currentNode.lastChild;
            }
        } else
        {
            while (currentNode !== null && currentNode.data !== null && 
                currentNode.data[0] !== tag)
            {
                notClosed.push(currentNode.data);
                currentNode = currentNode.parent;
            }
            currentNode = currentNode.parent;
        }
        return currentNode;
    }
    
    // -------------------------------------------------------
    /** Update all
    */
    update()
    {
        this.graphics = [];
        this.positions = [];
        this.heights = [];
        this.aligns = [];
        this.heights.push(0);
        let result = {
            g: this.graphics,
            p: this.positions,
            a: this.aligns,
            h: this.heights,
            ca: Align.Left,
            cb: false,
            ci: false,
            cs: RPM.defaultValue(RPM.datasGame.system.dbOptions.vtSize, RPM
                .fontSize),
            cf: RPM.defaultValue(RPM.datasGame.system.dbOptions.vtFont, RPM
                .fontName),
            ctc: RPM.defaultValue(RPM.datasGame.system.dbOptions.vtcText, RPM
                .COLOR_WHITE),
            cbc: RPM.defaultValue(RPM.datasGame.system.dbOptions.vtcBackground, 
                null),
            csc: RPM.defaultValue(RPM.datasGame.system.dbOptions.vtOutline, 
                false) ? RPM.defaultValue(RPM.datasGame.system.dbOptions
                .vtcOutline, null) : null
        };
    
        // Update nodes
        this.updateNodes(this.tree.root.firstChild, result);
    
        // Calculate width of align blocks for aligns settings
        this.totalWidths = [];
        let currentAlign, c, width, align;
        for (let i = 0, l = this.graphics.length; i < l; i++)
        {
            currentAlign = this.aligns[i];
            c = i;
            width = 0;
            while (c < l)
            {
                align = this.aligns[c];
                if (align !== currentAlign)
                {
                    break;
                }
                width += this.positions[c];
                c++;
            }
            this.totalWidths.push(width);
            i = c - 1;
        }
    }
    
    // -------------------------------------------------------
    /** Update the nodes
    *   @param {Node} node The current node
    *   @param {Object} result The result object
    */
    updateNodes(node, result)
    {
        let tag = node.data[0];
        let value = node.data[1];
        let graphic, bold, italic, align, size, font, textColor, backColor, 
            strokeColor;
        switch (tag)
        {
        case TagKind.NewLine:
            result.g.push(null);
            result.p.push(0);
            result.a.push(-1);
            if (result.h[0] === 0)
            {
                result.h[0] = result.cs;
            }
            result.h.unshift(0);
            break;
        case TagKind.Text:
        case TagKind.Variable:
        case TagKind.Parameter:
        case TagKind.Property:
        case TagKind.HeroName:
            let text;
            switch (node.data[0])
            {
            case TagKind.Text:
                text = value;
                break;
            case TagKind.Variable:
                text = RPM.numToString(value.getValue());
                break;
            case TagKind.Parameter:
                text = RPM.numToString(value.getValue());
                break;
            case TagKind.Property:
                text = RPM.numToString(value.getValue());
                break;
            case TagKind.HeroName:
                text = RPM.game.getHeroByInstanceID(value.getValue()).name;
                break;
            }
            graphic = new GraphicText(text, 
                {
                    bold: result.cb,
                    italic: result.ci,
                    fontSize: result.cs,
                    fontName: result.cf,
                    color: result.ctc,
                    backColor: result.cbc,
                    strokeColor: result.csc
                }
            );
            result.g.push(graphic);
            result.p.push(graphic.measureText());
            result.a.push(result.ca);
            if (graphic.fontSize > result.h[0])
            {
                result.h[0] = graphic.fontSize;
            }
            break;
        case TagKind.Icon:
            graphic = RPM.datasGame.pictures.get(PictureKind.Icons, value)
                .picture.createCopy();
            result.g.push(graphic);
            result.p.push(graphic.oW);
            result.a.push(result.ca);
            if (RPM.fontSize > result.h[0])
            {
                result.h[0] = RPM.fontSize;
            }
            break;
        case TagKind.Bold:
            bold = result.cb;
            result.cb = true;
            break;
        case TagKind.Italic:
            italic = result.ci;
            result.ci = true;
            break;
        case TagKind.Left:
            align = result.ca;
            result.ca = Align.Left;
            break;
        case TagKind.Center:
            align = result.ca;
            result.ca = Align.Center;
            break;
        case TagKind.Right:
            align = result.ca;
            result.ca = Align.Right;
            break;
        case TagKind.Size:
            size = result.cs;
            result.cs = RPM.datasGame.system.fontSizes[value].getValue();
            break;
        case TagKind.Font:
            font = result.cf;
            result.cf = RPM.datasGame.system.fontNames[value].getValue();
            break;
        case TagKind.TextColor:
            textColor = result.ctc;
            result.ctc = RPM.datasGame.system.colors[value];
            break;
        case TagKind.BackColor:
            backColor = result.cbc;
            result.cbc = RPM.datasGame.system.colors[value];
            break;
        case TagKind.StrokeColor:
            strokeColor = result.csc;
            result.csc = RPM.datasGame.system.colors[value];
            break;
        }
        if (node.firstChild !== null)
        {
            this.updateNodes(node.firstChild, result);
        }
        // Handle closures
        switch (node.data[0])
        {
        case TagKind.Bold:
            result.cb = bold;
            break;
        case TagKind.Italic:
            result.ci = italic;
            break;
        case TagKind.Left:
        case TagKind.Center:
        case TagKind.Right:
            result.ca = align;
            break;
        case TagKind.Size:
            result.cs = size;
            break;
        case TagKind.Font:
            result.cf = font;
            break;
        case TagKind.TextColor:
            result.ctc = textColor;
            break;
        case TagKind.BackColor:
            result.cbc = backColor;
            break;
        case TagKind.StrokeColor:
            result.csc = strokeColor;
            break;
        }
        // Go next if possible
        if (node.next !== null)
        {
            this.updateNodes(node.next, result);
        }
    }
    
    // -------------------------------------------------------
    /** Drawing the faceset behind
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawBehind(x, y, w, h)
    {
        if (!RPM.datasGame.system.dbOptions.vfPosAbove)
        {
            this.drawFaceset(x, y, w, h);
        }
    }
    
    // -------------------------------------------------------
    /** Drawing the faceset
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawFaceset(x, y, w, h)
    {
        this.faceset.draw(x + RPM.defaultValue(RPM.datasGame.system.dbOptions.fX
            , 0), y - ((this.faceset.oH - h) / 2) + RPM.defaultValue(RPM
            .datasGame.system.dbOptions.fY, 0));
    }
    
    // -------------------------------------------------------
    /** Drawing the message box
    *   @param {number} x The x position to draw graphic
    *   @param {number} y The y position to draw graphic
    *   @param {number} w The width dimention to draw graphic
    *   @param {number} h The height dimention to draw graphic
    */
    drawBox(x = this.oX, y = this.oY, w = this.oW, h = this.oH)
    {
        if (RPM.datasGame.system.dbOptions.vfPosAbove)
        {
            this.drawFaceset(x, y, w, h);
        }
        let newX = RPM.getScreenX(x + this.faceset.oW + RPM.HUGE_SPACE);
        let newY = RPM.getScreenY(y + RPM.HUGE_SPACE);
        let offsetY = 0;
        let align = -1;
        let c = this.heights.length - 1;

        // Draw each graphics
        let graphic, offsetX;
        for (let i = 0, j = 0, l = this.graphics.length; i < l; i ++)
        {
            graphic = this.graphics[i];
    
            // New line
            if (graphic === null)
            {
                offsetY += RPM.getScreenMinXY(this.heights[c--] * 2);
                align = -1;
                j++;
            } else
            {
                if (align !== this.aligns[i])
                {
                    align = this.aligns[i];
                    switch (align) {
                    case Align.Left:
                        offsetX = 0;
                        break;
                    case Align.Center:
                        offsetX = (RPM.getScreenX(w) - RPM.getScreenMinXY(this
                            .totalWidths[j]) - newX) / 2;
                        break;
                    case Align.Right:
                        offsetX = RPM.getScreenX(w) - RPM.getScreenMinXY(this
                            .totalWidths[j]) - newX;
                        break;
                    }
                    j++;
                }
                if (graphic.path)
                {
                    graphic.draw(newX + offsetX, newY - (graphic.h / 2) + 
                        offsetY,  graphic.oW, graphic.oH, 0, 0, graphic.oW, 
                        graphic.oH, false);
                } else
                {
                    graphic.draw(newX + offsetX, newY + offsetY, graphic.oW,
                        graphic.oH, false);
                }
                offsetX += RPM.getScreenMinXY(this.positions[i]);
            }
        }
    }
}