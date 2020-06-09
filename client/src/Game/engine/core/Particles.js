import Proton from "three.proton.js";
import { TextureLoader } from "expo-three";
import * as THREE from "three";

import GameObject from "./GameObject";

class Snow extends GameObject {
  proton = new Proton();
  debug = false;
  async loadAsync(...props) {
    const { camera, scene, renderer } = this.game;
    const size = 150;
    const emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(
      new Proton.Span(10, 20),
      new Proton.Span(1, 2)
    );

    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(new Proton.Span(10, 0.01)));
    const position = new Proton.Position();
    const positionZone = new Proton.BoxZone(size, size / 2, size * 3);
    position.addZone(positionZone);
    emitter.addInitialize(position);

    emitter.addInitialize(new Proton.Life(5, 10));

    const sprite = await this.createSprite(
      require("../../../assets/images/particle.png")
    );
    emitter.addInitialize(new Proton.Body(sprite));
    // emitter.addInitialize(
    //   new Proton.Velocity(0, new Proton.Vector3D(0, -0.05, -0.05), 90),
    // );

    emitter.addBehaviour(new Proton.Alpha(0, 0.3));
    emitter.addBehaviour(new Proton.RandomDrift(1.0, 0.1, 1.0, 0.05));
    // emitter.addBehaviour(new Proton.Gravity(0.1));
    emitter.addBehaviour(new Proton.Scale(2, 0.001));

    this.repulsionBehaviour = new Proton.Repulsion(
      new Proton.Vector3D(0, 0, 0),
      0,
      0
    );
    const zone = new Proton.BoxZone(400);
    this.crossZoneBehaviour = new Proton.CrossZone(zone, "cross");
    emitter.addBehaviour(this.repulsionBehaviour, this.crossZoneBehaviour);

    // const screenZone = new Proton.ScreenZone(camera, renderer, size, '1234');
    // var lineZone = new Proton.ScreenZone(0, 0, 0, 100, 100, 0);
    // const crossZone = new Proton.CrossZone(screenZone, 'dead');
    // emitter.addBehaviour(crossZone);
    emitter.p.x = 0;
    // emitter.p.y = size;
    emitter.p.y = 0; // size * 0.5;

    emitter.emit();

    this.proton.addEmitter(emitter);
    this.proton.addRender(new Proton.SpriteRender(scene));
    this.emitter = emitter;

    if (this.debug) {
      Proton.Debug.drawEmitter(this.proton, scene, this.emitter);
      // Proton.Debug.drawZone(this.proton, scene, lineZone);

      // Proton.Debug.drawZone(this.proton, scene, crossZone);
      Proton.Debug.drawZone(this.proton, scene, positionZone);
    }

    return super.loadAsync(...props);
  }

  impulse = () => {
    // if (this.impulseBehaviour) {
    //   this.emitter.removeBehaviour(this.impulseBehaviour);
    // }
    this.repulsionBehaviour.reset(new Proton.Vector3D(0, 0, 0), 10, 50);

    setTimeout(() => {
      this.repulsionBehaviour.reset(new Proton.Vector3D(0, 0, 0), 0, 0);
      // this.emitter.removeBehaviour(behaviour);
    }, 300);
    // this.impulseBehaviour = behaviour;
  };

  createSprite = async (resource) => {
    const material = new THREE.SpriteMaterial({
      map: new TextureLoader().load(resource),
      transparent: true,
      opacity: 0.5,
      color: 0xffffff,
    });
    this.sprite = new THREE.Sprite(material);
    return this.sprite;
  };

  update(delta, time) {
    super.update(delta, time);

    this.proton.update();
  }
}

export default Snow;
