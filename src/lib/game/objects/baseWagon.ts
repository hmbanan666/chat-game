import { Sprite } from 'pixi.js'
import type { GraphicsContainer } from '../components/graphicsContainer'
import { WagonCargoContainer } from '../components/wagonCargoContainer'
import { WagonEngineCloudsContainer } from '../components/wagonEngineCloudsContainer'
import { WagonEngineContainer } from '../components/wagonEngineContainer'
import { WagonFuelBoxContainer } from '../components/wagonFuelBoxContainer'
import { WagonWheelContainer } from '../components/wagonWheelContainer'
import { BaseObject } from './baseObject'
import type { Game } from '$lib/game/types'
import { Mechanic } from '$lib/game/objects/units/mechanic'
import type { Wagon } from '$lib/game/services/wagon/interface'

interface IWagonOptions {
  game: Game
  x: number
  y: number
}

export class BaseWagon extends BaseObject implements Wagon {
  public fuel!: number
  public visibilityArea!: Wagon['visibilityArea']
  public cargoType: Wagon['cargoType']

  public children: GraphicsContainer[] = []
  public mechanic!: Mechanic
  public serverDataArea!: Wagon['visibilityArea']
  public collisionArea!: Wagon['visibilityArea']

  constructor({ game, x, y }: IWagonOptions) {
    super({ game, x, y, type: 'WAGON' })

    this.speedPerSecond = 0
    this.fuel = 2000

    this.#updateVisibilityArea()
    this.#updateServerDataArea()

    this.#initMechanic()
    this.#initGraphics()
  }

  live() {
    this.#updateVisibilityArea()
    this.#updateServerDataArea()
    this.#updateCollisionArea()
    this.#updateMechanic()
    this.#consumeFuel()
  }

  #consumeFuel() {
    if (this.speedPerSecond <= 0) {
      return
    }

    this.fuel -= this.speedPerSecond * 2
  }

  refuel(woodAmount: number): void {
    if (woodAmount < 0) {
      return
    }

    this.fuel += woodAmount * 5 * 40
  }

  emptyFuel(): void {
    this.fuel = 0
  }

  #updateVisibilityArea() {
    const offsetX = 2560 / 2
    const offsetY = 1440 / 2

    this.visibilityArea = {
      startX: this.x - offsetX,
      endX: this.x + offsetX,
      startY: this.y - offsetY,
      endY: this.y + offsetY,
    }
  }

  #updateServerDataArea() {
    const offsetX = 2560 * 1.5
    const offsetY = 1440

    this.serverDataArea = {
      startX: this.x - offsetX,
      endX: this.x + offsetX,
      startY: this.y - offsetY,
      endY: this.y + offsetY,
    }
  }

  #updateCollisionArea() {
    const offsetX = 250
    const offsetY = 180

    this.collisionArea = {
      startX: this.x - offsetX,
      endX: this.x + offsetX,
      startY: this.y - offsetY,
      endY: this.y + offsetY,
    }
  }

  checkIfPointInCollisionArea(point: { x: number, y: number }) {
    return (
      this.collisionArea.startX < point.x
      && point.x < this.collisionArea.endX
      && this.collisionArea.startY < point.y
      && point.y < this.collisionArea.endY
    )
  }

  public checkIfPointInVisibilityArea(point: { x: number, y: number }) {
    return (
      this.visibilityArea.startX < point.x
      && point.x < this.visibilityArea.endX
      && this.visibilityArea.startY < point.y
      && point.y < this.visibilityArea.endY
    )
  }

  public checkIfPointInServerDataArea(point: { x: number, y: number }) {
    return (
      this.serverDataArea.startX < point.x
      && point.x < this.serverDataArea.endX
      && this.serverDataArea.startY < point.y
      && point.y < this.serverDataArea.endY
    )
  }

  #initMechanic() {
    this.mechanic = new Mechanic({
      game: this.game,
      x: this.x,
      y: this.y,
    })
    this.mechanic.init()
  }

  #updateMechanic() {
    this.mechanic.live()
    this.mechanic.direction = 'LEFT'
    this.mechanic.x = this.x - 50
    this.mechanic.y = this.y - 48
  }

  animate() {
    super.animate()

    for (const container of this.children) {
      container.visible = true

      this.#drawWheels(container)
      this.#drawEngine(container)
      this.#drawCargo(container)
      this.#drawFuel(container)

      if (container instanceof WagonEngineCloudsContainer) {
        container.animate(this.speedPerSecond)
      }
    }

    this.#handleSoundByState()
  }

  #initGraphics() {
    const spriteSide = Sprite.from('wagonBase1')
    spriteSide.anchor.set(0.5, 1)
    spriteSide.scale = 0.75

    const spriteBase = Sprite.from('wagonBase2')
    spriteBase.anchor.set(0.5, 1)
    spriteBase.scale = 0.75

    const cargo = WagonCargoContainer.create()
    cargo.scale = 0.75

    const engine = WagonEngineContainer.create('wagonEngine1', 'RIGHT')
    engine.scale = 0.75

    const storage = WagonFuelBoxContainer.create()
    storage.scale = 0.75

    const wheel1 = WagonWheelContainer.create('wagonWheel1', 'RIGHT', 'LEFT')
    const wheel2 = WagonWheelContainer.create('wagonWheel1', 'RIGHT', 'RIGHT')
    wheel1.scale = 0.75
    wheel2.scale = 0.75

    const clouds = new WagonEngineCloudsContainer({ wagon: this })

    this.addChild(
      spriteBase,
      engine,
      cargo,
      spriteSide,
      storage,
      wheel1,
      wheel2,
      clouds,
    )
  }

  #drawWheels(container: GraphicsContainer) {
    if (container instanceof WagonWheelContainer) {
      if (container.side === 'LEFT') {
        container.x = -123
        container.y = -16
      }
      if (container.side === 'RIGHT') {
        container.x = 123
        container.y = -16
      }

      container.visible = true

      const wheelRotation = this.direction === 'LEFT' ? -1 : 1

      container.angle += (wheelRotation * this.speedPerSecond) / 2.5
    }
  }

  #drawEngine(container: GraphicsContainer) {
    if (container instanceof WagonEngineContainer) {
      container.x = -102
      container.y = -58

      container.visible = true
    }
  }

  #drawCargo(container: GraphicsContainer) {
    if (container instanceof WagonCargoContainer) {
      if (this.cargoType === 'CHEST') {
        container.visible = true
        for (const c of container.children) {
          c.visible = true
        }
      }

      if (!this.cargoType) {
        container.visible = false
      }
    }
  }

  #drawFuel(container: GraphicsContainer) {
    let initFuel = this.fuel
    if (container instanceof WagonFuelBoxContainer) {
      for (const c of container.children) {
        for (const fuelSprite of c.children) {
          fuelSprite.visible = false
          initFuel -= 500

          if (initFuel > 500) {
            fuelSprite.visible = true
          }
        }
      }
    }
  }

  #handleSoundByState() {
    if (this.state === 'MOVING') {
      this.game.audio.playSound('WAGON_MOVING')
    }
  }
}
