import _ from 'lodash'
/**
 * TODO take ratio into account
 * TODO use integers
 * TODO have a max distancec and/or inverse proportional repulsion
 */
export default class Spring {

  constructor(graph) {
    this.graph = graph
    this.iterations = 500
    this.maxRepulsiveForceDistance = 6
    this.k = 2
    this.c = 0.01
    this.maxVertexMovement = 0.5
    this.layout()
  }

  static create(...args) {
    return new this(...args)
  }

  layout() {
    this.layoutPrepare()
    for (let i = 0; i < this.iterations; i++) {
      this.layoutIteration()
    }
    this.layoutCalcBounds()
  }

  layoutPrepare() {
    _.each(this.graph.nodes, node => {
      node.layoutPosX = 0
      node.layoutPosY = 0
      node.layoutForceX = 0
      node.layoutForceY = 0
    })
  }

  layoutIteration() {
    // Forces on nodes due to node-node repulsions
    let prev = []
    _.each(this.graph.nodes, node1 => {
      prev.forEach(node2 => {
        this.layoutRepulsive(node1, node2)
      })
      prev.push(node1)
    })

    // Forces on nodes due to edge attractions
    this.graph.edges.forEach(edge => {
      this.layoutAttractive(edge)
    })

    // Move by the given force
    _.each(this.graph.nodes, node => {
      let xmove = this.c * node.layoutForceX
      let ymove = this.c * node.layoutForceY

      let max = this.maxVertexMovement

      if (xmove > max) xmove = max
      if (xmove < -max) xmove = -max
      if (ymove > max) ymove = max
      if (ymove < -max) ymove = -max

      node.layoutPosX += xmove
      node.layoutPosY += ymove
      node.layoutForceX = 0
      node.layoutForceY = 0
    })
  }

  layoutRepulsive(node1, node2) {
    if (typeof node1 == 'undefined' || typeof node2 == 'undefined')
      return
    let dx = node2.layoutPosX - node1.layoutPosX
    let dy = node2.layoutPosY - node1.layoutPosY
    let d2 = dx * dx + dy * dy
    if (d2 < 0.01) {
      dx = 0.1 * Math.random() + 0.1
      dy = 0.1 * Math.random() + 0.1
      d2 = dx * dx + dy * dy
    }
    let d = Math.sqrt(d2)
    if (d < this.maxRepulsiveForceDistance) {
      let repulsiveForce = this.k * this.k / d
      node2.layoutForceX += repulsiveForce * dx / d
      node2.layoutForceY += repulsiveForce * dy / d
      node1.layoutForceX -= repulsiveForce * dx / d
      node1.layoutForceY -= repulsiveForce * dy / d
    }
  }

  layoutAttractive(edge) {
    let node1 = edge.source
    let node2 = edge.target

    let dx = node2.layoutPosX - node1.layoutPosX
    let dy = node2.layoutPosY - node1.layoutPosY
    let d2 = dx * dx + dy * dy
    if (d2 < 0.01) {
      dx = 0.1 * Math.random() + 0.1
      dy = 0.1 * Math.random() + 0.1
      d2 = dx * dx + dy * dy
    }
    let d = Math.sqrt(d2)
    if (d > this.maxRepulsiveForceDistance) {
      d = this.maxRepulsiveForceDistance
      d2 = d * d
    }
    let attractiveForce = (d2 - this.k * this.k) / this.k
    if (edge.attraction === undefined) edge.attraction = 1
    attractiveForce *= Math.log(edge.attraction) * 0.5 + 1

    node2.layoutForceX -= attractiveForce * dx / d
    node2.layoutForceY -= attractiveForce * dy / d
    node1.layoutForceX += attractiveForce * dx / d
    node1.layoutForceY += attractiveForce * dy / d
  }

  layoutCalcBounds() {
    let minx = Infinity
    let maxx = -Infinity
    let miny = Infinity
    let maxy = -Infinity

    _.each(this.graph.nodes, node => {
      let x = node.layoutPosX
      let y = node.layoutPosY

      if (x > maxx) maxx = x
      if (x < minx) minx = x
      if (y > maxy) maxy = y
      if (y < miny) miny = y
    })

    this.layoutMinX = minx
    this.layoutMaxX = maxx
    this.layoutMinY = miny
    this.layoutMaxY = maxy
  }

  transformCoords() {
    // TODO for drawing, the coordinates need to be transformed
  }

}
