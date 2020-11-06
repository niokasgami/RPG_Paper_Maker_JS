/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/


import THREE from "three";
import {Mountain,TextureSeveral} from ".";

/**
 * The wrapper class for handle mountains sharing the same texture.
 */
export class Mountains
{
    texture: TextureSeveral;
    width: number;
    height: number;
    geometry: THREE.Geometry;
    count: number;
    mesh: THREE.Mesh;

    constructor(texture: TextureSeveral)
    {
        this.texture = texture;
        this.width = texture.texture.map.image.width;
        this.height = texture.texture.map.image.height;
        this.geometry = new THREE.Geometry();
        this.geometry.faceVertexUvs[0] = [];
        this.count = 0;
        this.mesh = null;
    }

    // -------------------------------------------------------
    /** Update the geometry of the mountains according to a mountain
    *   @param {number[]} position The json position
    *   @param {Mountain} mountain The moutain to update
    */
    updateGeometry(position: number[], mountain: Mountain)
    {
        let res = mountain.updateGeometry(this.geometry, this.texture, position,
            this.count);
        this.count = res[0];
        return res[1];
    }

    // -------------------------------------------------------
    /** Create a mesh with material and geometry
    */
    createMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.texture.texture);
    }
}