/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

/** @class
 *   Autotiles grouped with the same textures
 *   @property {number} [Autotiles.COUNT_LIST=5] The tiles list sizes
 *   @property {number[]} Autotiles.LIST_A The tiles list A
 *   @property {number[]} Autotiles.LIST_B The tiles list B
 *   @property {number[]} Autotiles.LIST_C The tiles list C
 *   @property {number[]} Autotiles.LIST_D The tiles list D
 *   @property {THREE.Texture} texture The autotiles texture
 *   @property {number} width The texture total width
 *   @property {number} height The texture total height
 *   @property {THREE.Geometry} geometry The autotiles geometry
 *   @property {THREE.Mesh} mesh The autotiles mesh
 *   @property {number} index The faces index (count)
 */
import THREE from "three";
import {TextureBundle} from ".";

export class Autotiles {
    static COUNT_LIST = 5;
    static LIST_A = ["A1", "A2", "A3", "A4", "A5"];
    static LIST_B = ["B1", "B2", "B3", "B4", "B5"];
    static LIST_C = ["C1", "C2", "C3", "C4", "C5"];
    static LIST_D = ["D1", "D2", "D3", "D4", "D5"];
    static AUTOTILE_BORDER = {
        "A1": 2,
        "B1": 3,
        "C1": 6,
        "D1": 7,
        "A2": 8,
        "B4": 9,
        "A4": 10,
        "B2": 11,
        "C5": 12,
        "D3": 13,
        "C3": 14,
        "D5": 15,
        "A5": 16,
        "B3": 17,
        "A3": 18,
        "B5": 19,
        "C2": 20,
        "D4": 21,
        "C4": 22,
        "D2": 23,
    };

    texture: TextureBundle;
    width: number;
    height: number;
    geometry: THREE.Geometry;
    mesh: THREE.Mesh;
    index: number;

    constructor(texture) {
        this.texture = texture;
        this.width = texture.texture.map ? texture.texture.map.image.width : 0;
        this.height = texture.texture.map ? texture.texture.map.image.height : 0;
        this.geometry = new THREE.Geometry();
        this.geometry.faceVertexUvs[0] = [];
        this.mesh = null;
        this.index = 0;
    }

    // -------------------------------------------------------
    /** Update the geometry of the autotiles according to an autotile and its
     *   position
     *   @param {number[]} position The json position
     *   @param {Autotile} autotile The autotile to add to geometry
     */
    updateGeometry(position, autotile) {
        return this.width === null || this.height === 0 ? null : autotile
            .updateGeometry(this.geometry, this.texture, position, this.width,
                this.height, this.index++);
    }

    // -------------------------------------------------------
    /** Create a mesh with material and geometry
     */
    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.texture.texture);
    }
}