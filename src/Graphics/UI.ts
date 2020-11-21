import {Vector2} from "../core/Vector2";
import {Node} from "../core";

/**
 * The Graphics class who manage UI
 * @experimental
 * @author Nio Kasgami
 * TODO : maybe use viewports?
 */
export class UI extends Node {

    private _layers: LayeredSprite;
    private _transform: Vector2;

    constructor(parent, data) {
        super(parent, data);
    }
}