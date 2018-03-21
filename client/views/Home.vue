<template>
    <main>
        <span id="toolTip" @mouseover="$modal.show('intro')">?</span>
        <div id="canvas"></div>
        <div id="intentions">
            <p v-for="intention in activeIntentions">{{intention}}</p>
        </div>
        <div id="buttons">
            <div class="button" v-for="(frequency, index) in frequencies" @click="activate(index)">
                <span>{{frequency.freq}}Hz</span>
            </div>
        </div>
        <logo id="logo"></logo>
        <modal name="intro" onselectstart='return false;'>
            <div id="modal">
                <label>Vibrational Healing</label>
                <p>Create a generative, healing drone using the sacred <a href="https://www.gaiameditation.com/ancient-solfeggio-frequencies-healing-properties/">Solfeggio frequencies</a> to return physical, mental, and spiritual balance. Drone generated through <a href="https://en.wikipedia.org/wiki/Watts%E2%80%93Strogatz_model">Watts-Strogatz</a> model. Headphones recommended.</p>
                <p> Use <a href="https://attunedvibrations.com/how-to-use-solfeggio-frequencies/">at least three times a week.</a> The art and labels are generated every page load; refresh until you've found what you're seeking. A description of the frequency's purpose appears when hovering - add in the amount needed.
                </p>
                <div>
                    <label>How Does It Work?</label><span class="viewToggle" @click="workVisible = !workVisible"><span v-if="workVisible">hide</span><span v-else>show</span></span>
                </div>
                <div v-if="workVisible">
                    <p>The drone is structured by a <a href="https://en.wikipedia.org/wiki/Watts%E2%80%93Strogatz_model">Watts-Strogatz</a> network - a model that explains naturally occuring 'small-world' phenomena seen in human societies, cellular structures, and systems of power.</p>
                    <p>Clicking a frequency activates a random node which - based on its relationship with its neighbors - has a chance of passing its signal to a neighbor. The more nodes activate, the louder the sound and the more powerful the effect.</p>
                    <p>The graph itself is generated randomly on page load. When a node is active lines appear showing the nodes to which it is connected. If the line is colored the connection is positive and the node shares its charge with its neighbor. If the line is black the node does not share its charge.</p>
                    <p> Fifteen seconds after the chain has stopped expanding the volume of the drone decreases. The image and labels are probabilistically generated - refresh for a new set.</p>
                </div>
                <div>
                    <label>What's It Built With?</label><span class="viewToggle" @click="githubVisible = !githubVisible"><span v-if="githubVisible">hide</span><span v-else>show</span></span>
                </div>
                <div v-if="githubVisible">
                    <p><a href="https://vuejs.org/">Vue.js</a>, <a href="https://tonejs.github.io/">Tone.js</a>, <a href="https://p5js.org/">p5.js</a>, and <a href="https://aws.amazon.com/polly/">Amazon Polly</a>. Full source here</p>
                </div>
            </div>
        </modal>
    </main>
</template>
<script>
var Tone = require('tone')
var p5 = require('p5')
var _ = require('lodash')
import logo from '../views/logo.vue'
export default {
    components: {
        logo
    },
    // These are universal values/variables and methods we'll be using everywhere
    data() {
        return {
            // p5
            usedPositions: [],
            nodeArray: [],
            labelLocations: [],
            activations: [],
            activationCount: 0,
            frequencies: [{
                title: 'please encourage your cells to do their best',
                freq: 174,
                color: {
                    h: 353,
                    s: 60,
                    b: 30
                },
                count: 0
            }, {
                title: 'rebuild yourself. it is said to work.',
                freq: 285,
                color: {
                    h: 40,
                    s: 63,
                    b: 35
                },
                count: 0
            }, {
                title: 'guilt. one of the fundamental obstacles of realization.',
                freq: 396,
                color: {
                    h: 57,
                    s: 79,
                    b: 40
                },
                count: 0
            }, {
                title: 'remove the destructive influence of past events',
                freq: 417,
                color: {
                    h: 107,
                    s: 42,
                    b: 45
                },
                count: 0
            }, {
                title: 'imagination, intention, intuition, and for your best purpose.',
                freq: 528,
                color: {
                    h: 179,
                    s: 35,
                    b: 50
                },
                count: 0
            }, {
                title: 'we will work on issues related to families, partners, friends, social problems and so on',
                freq: 639,
                color: {
                    h: 244,
                    s: 42,
                    b: 55
                },
                count: 0
            }, {
                title: 'a pure and stable life',
                freq: 741,
                color: {
                    h: 292,
                    s: 33,
                    b: 60
                },
                count: 0
            }, {
                title: 'see the illusion of your life',
                freq: 852,
                color: {
                    h: 198,
                    s: 40,
                    b: 70
                },
                count: 0
            }, {
                title: 'direct experience is possible',
                freq: 936,
                color: {
                    h: 34,
                    s: 25,
                    b: 80
                },
                count: 0
            }],

            // ToneJS Config
            drone: { in : {},
                delay: {},
                reverb: {},
                panner: {},
                out: {}
            },

            // Page
            activeIntentions: [],
            workVisible: false,
            githubVisible: false
        }
    },
    methods: {
        // Flips one node to active then sets up a function that will create an activation path and track it on a per-cycle basis
        activate(frequencyIndex) {
            // use the variable 'system' to refer to the top level data
            // NB: This is just some JS nonsense. Just know that 'system' refers to the the top level data and methods
            var system = this

            // Create an object that contains metadata about the activation path
            let activationPath = {
                id: system.activationCount,
                activeNodes: [],
                proximityNodes: [],
                stable: false,
                drone: {}
            }

            var selectedFrequency = system.frequencies[frequencyIndex]

            this.activeIntentions.push(selectedFrequency.title)

            // Sets the activation path's core frequency
            activationPath.frequency = selectedFrequency

            // Create ToneJS drone
            let osc = new Tone.OmniOscillator({
                frequency: selectedFrequency.freq,
            })

            activationPath.drone.oscillator = osc
            activationPath.drone.wobble = new Tone.AutoPanner()
            activationPath.drone.tremolo = new Tone.Tremolo({
                frequency: _.random(1, 3),
                depth: _.random(0, 0.2)
            })
            activationPath.drone.vibrato = new Tone.Vibrato({
                frequency: _.random(1, 3),
                depth: _.random(0, 0.2)
            })
            activationPath.drone.chorus = new Tone.Chorus({
                frequency: 2,
                delayTime: 0,
                depth: 1
            })
            activationPath.drone.out = new Tone.Gain(0)

            activationPath.drone.oscillator.chain(activationPath.drone.wobble, activationPath.drone.tremolo, activationPath.drone.vibrato, activationPath.drone.chorus, activationPath.drone.out, system.drone.in)
            activationPath.drone.oscillator.start()

            // Randomly select a reference to the node using lodash's sample method
            let targetNode = system.nodeArray[Math.floor(Math.random() * system.nodeArray.length)]
                // Make our new active node active!
            targetNode.activations.push(selectedFrequency.color)
                // Push it to the activeNodes array
            activationPath.activeNodes.push(targetNode)


            // Create a cycle function that will be called once per frame by p5
            activationPath.cycle = function() {
                // Check if the cycle is stable
                if (!this.stable) {
                    // // Play the note at start of cycle
                    // this.patch.synth.triggerAttackRelease(this.patch.notes, 0.25)

                    // Go through the array of active nodes one-by-one
                    this.activeNodes.forEach(node => {
                        // For each node in the connectedNodes array
                        node.connectedNodes.forEach(connectedNode => {
                            // check if it's already present in the proximity nodes array using lodash's 'some' function
                            if (!_.some(this.proximityNodes, {
                                    id: connectedNode.id
                                })) {
                                // if it's not push it to the proximityNodes array so we can check if it's going to activate next cycle
                                let node = system.nodeArray[connectedNode.id]
                                this.proximityNodes.push(node)
                            }
                        })
                    })

                    // Create a variable to track new activeNodes so we can see if the system has changed
                    let newNodes = false

                    // Go through each proximityNode and check if they're going to activate
                    this.proximityNodes.forEach(proximityNode => {
                        // reset activationValue (we run this code for each proximityNode so we need to reset our values)
                        let activationValue = 0

                        // Iterate through each node connected to the proximityNode
                        proximityNode.connectedNodes.forEach((connectedNode) => {
                            var sign
                            if (system.nodeArray[connectedNode.id].activations.length > 0) {
                                sign = 1
                            } else {
                                sign = 0
                            }

                            // and add their score to the activationValue
                            activationValue += sign * connectedNode.flow
                        })

                        // change the sign of the active node based on the resulting score
                        // if the proximityNode's score is greater than one and its not already in the activeNodes array add it
                        if (activationValue > 0 && !_.some(this.activeNodes, {
                                id: proximityNode.id
                            })) {
                            proximityNode.activations.push(this.frequency.color)
                            proximityNode.color = this.frequency.color
                            this.activeNodes.push(proximityNode)
                            this.frequency.count++
                                newNodes = true

                        } else if (activationValue < 0) {
                            // if the proximityNode's score is less than one turn it off
                            proximityNode.sign = 0
                            _.pull(proximityNode.activations, this.frequency.color)

                            // find out if the node is currently in the activeNodes array
                            let nodeIndex = _.findIndex(this.activeNodes, {
                                id: proximityNode.id
                            })

                            // and deactivate and remove it if it is
                            if (nodeIndex > -1) {
                                this.activeNodes.splice(nodeIndex, 1)
                                this.frequency.count--
                            }
                        }
                    })

                    this.drone.out.set({
                        gain: this.frequency.count / 3000
                    })

                    // Check if there are any new activeNodes and if there aren't set the system as stable and change the synth's patch
                    if (newNodes) {
                        this.stable = false
                    } else {
                        this.stable = true
                        setTimeout(_.bind(this.close, this), 15000)
                    }

                }

            }

            // Deactivate the paths nodes after it's stable
            activationPath.close = function() {
                this.activeNodes.forEach(node => {
                    _.pull(node.activations, this.frequency.color)
                })
                var intentionIndex = _.findIndex(system.activeIntentions, this.frequency.title)
                system.activeIntentions.pop(intentionIndex, 1)

                this.drone.out.set({
                    gain: .00005
                }, 15)
            }

            // and push it to the activations array so we can control it
            system.activations.push(activationPath)

            // increase the activation count so we have distinct ids for each activation path
            system.activationCount++
        },
        Node(id, xPos, yPos, diameter) {
            let newNode = {
                id: id,
                xPos: xPos,
                yPos: yPos,
                diameter: diameter,
                connectedNodes: [],
                activations: [],
                sign: 0,
                color: {
                    h: 0,
                    s: 0,
                    b: 0
                },
                determineColor: function() {
                    let computedColor = {
                        h: 0,
                        s: 0,
                        b: 0
                    }

                    this.activations.forEach(color => {
                        computedColor.h += color.h
                        computedColor.s += color.s
                        computedColor.b += color.b
                    })

                    if (this.activations.length > 0) {
                        computedColor.h /= this.activations.length
                        computedColor.s /= this.activations.length
                        computedColor.b /= this.activations.length

                    }

                    this.color = computedColor
                },
                // If the node is active (sign === 1) draw a line to each connected node and color based on flow direction
                drawCxn: function(sketch) {
                    if (this.activations.length > 0) {
                        this.connectedNodes.forEach((node) => {
                            if (node.flow > 0) {
                                // If the connected node is also active draw the line a little darker to show that it is positive in both directions
                                if (node.node.activations.length > 0) {
                                    sketch.stroke(this.color.h, this.color.s, this.color.b, 0.75)
                                } else {
                                    sketch.stroke(this.color.h, this.color.s, this.color.b, 0.25)
                                }
                            } else {
                                sketch.stroke(0, 0, 0, 0.25)
                            }

                            sketch.line(this.xPos, this.yPos, node.node.xPos, node.node.yPos)
                        })

                    }
                },
                drawEllipse: function(sketch) {
                    sketch.fill(this.color.h, this.color.s, this.color.b)
                    sketch.stroke('black')
                    sketch.ellipse(this.xPos, this.yPos, this.diameter, this.diameter)
                }
            }

            return newNode
        },
        newShape() {
            var group = []
            var cycles = 0
            var shapeNodes = _.random(3, 12)

            function continueDrawing(coordinate) {
                var uniqueCoordinates = _.uniqWith(group, _.isEqual)
                return uniqueCoordinates.length < shapeNodes && cycles < 100
            }

            function isLegal(coordinate, usedPositions) {
                return _.inRange(coordinate.x, 1, 19) && _.inRange(coordinate.y, 1, 11) && !_.some(usedPositions, coordinate)
            }

            function nextStep(coordinate) {
                var nextCoordinate = Object.assign({}, coordinate)
                var coordinateToChange = _.sample(['x', 'y'])
                var amountToChange = _.sample([1, -1])

                nextCoordinate[coordinateToChange] += amountToChange
                return nextCoordinate
            }

            function findUsedPositions(group) {
                var boundaryNodes = []

                group.forEach(nodePos => {
                    var increaseX = {
                        x: nodePos.x + 1,
                        y: nodePos.y
                    }
                    boundaryNodes.push(increaseX)
                    var decreaseX = {
                        x: nodePos.x - 1,
                        y: nodePos.y
                    }
                    boundaryNodes.push(decreaseX)
                    var increaseY = {
                        x: nodePos.x,
                        y: nodePos.y + 1
                    }
                    boundaryNodes.push(increaseY)
                    var decreaseY = {
                        x: nodePos.x,
                        y: nodePos.y - 1
                    }
                    boundaryNodes.push(increaseY)
                    var increaseXY = {
                        x: nodePos.x + 1,
                        y: nodePos.y + 1
                    }
                    boundaryNodes.push(increaseXY)
                    var increaseXdecreaseY = {
                        x: nodePos.x + 1,
                        y: nodePos.y - 1
                    }
                    boundaryNodes.push(increaseXdecreaseY)
                    var decreaseXdecreaseY = {
                        x: nodePos.x - 1,
                        y: nodePos.y - 1
                    }
                    boundaryNodes.push(decreaseXdecreaseY)
                    var decreaseXincreaseY = {
                        x: nodePos.x - 1,
                        y: nodePos.y + 1
                    }
                    boundaryNodes.push(decreaseXincreaseY)
                })

                boundaryNodes.concat(group)
                return boundaryNodes
            }

            var coordinate = {
                x: _.random(1, 19),
                y: _.random(1, 11)
            }

            while (continueDrawing(coordinate)) {
                var nextCoordinate = nextStep(coordinate)
                if (isLegal(nextCoordinate, this.usedPositions)) {
                    group.push({
                        x: nextCoordinate.x,
                        y: nextCoordinate.y
                    })
                    coordinate = nextCoordinate
                }
                cycles++
            }

            var finalGroup = _.uniqWith(group, _.isEqual)

            if (finalGroup.length > 0) {
                var largestY = _.maxBy(_.values(finalGroup), 'y')
                var topYs = _.filter(finalGroup, {
                    y: largestY.y
                })
                var labelPosition = _.minBy(_.values(topYs), 'x')

                this.labelLocations.push(labelPosition)
                var allCoordinates = findUsedPositions(finalGroup)
                this.usedPositions = this.usedPositions.concat(allCoordinates)
            }

            return finalGroup
        },
        reset() {
            var nodePositions = []
            for (var x = 0; x < 4; x++) {
                nodePositions = nodePositions.concat(this.newShape())
            }

            nodePositions.forEach((node, index) => {
                if (Math.random() < 0.1) {
                    nodePositions.splice(index, 1)
                }
            })



            // Create node objects for system to work with
            for (var j = 0; j < nodePositions.length; j++) {
                var diameterPx = 60
                var xPos = nodePositions[j].x * diameterPx
                var yPos = nodePositions[j].y * diameterPx

                let node = new this.Node(j, xPos, yPos, diameterPx / 2)
                this.nodeArray.push(node)
            }

            // Add connectedNodes to each node
            this.nodeArray.forEach((node) => {
                var relativeNodePositions = [-2, -1, 1, 2]
                    // Go through each of the relative node positions and connect the node in that relative position
                relativeNodePositions.forEach((distance) => {
                    let id
                    if (distance < 0) {
                        id = (this.nodeArray.length + node.id + distance) % this.nodeArray.length
                    } else {
                        id = (node.id + distance) % this.nodeArray.length
                    }

                    // node should probably be a reference to the id - which would then call vue's this.nodeArray[node.id] when needed - but because I don't understand enough about how p5 and vue work I don't want to go through the effort when this works :/
                    let connectedNode = {
                        id: id,
                        node: this.nodeArray[id],
                        flow: _.sample([-1, 1])
                    }

                    node.connectedNodes.push(connectedNode)

                })

            })
        }
    },
    // This code is run as soon as the page is done loading
    mounted() {
        if (!window.localStorage.oracleIntro) {
            this.$modal.show('intro')
        }
        localStorage.setItem('oracleIntro', true)
            // General Tone configurations
        this.drone.in = new Tone.Gain()
        this.drone.reverb = new Tone.Freeverb(0.7, 5000)
        this.drone.delay = new Tone.FeedbackDelay(0, 0)
        this.drone.paner = new Tone.AutoPanner()
        this.drone.out = new Tone.Gain()

        // Create Tone chain
        this.drone.in.chain(this.drone.reverb, this.drone.delay, this.drone.paner, this.drone.out, Tone.Master)

        Tone.Transport.start()

        // P5 set/up/
        var myp5 = new p5((sketch) => {
            sketch.setup = () => {
                let canvas = sketch.createCanvas(1200, 720)
                canvas.parent('canvas')
                sketch.frameRate(1)
                this.reset()
                var graphLabels = ['You', 'Here', 'There', 'Us', 'What\'s Next', 'The Past', 'Unavoidably', 'Everyone Else']
                var shuffledLabels = _.shuffle(graphLabels)

                this.labelLocations.forEach((labelLocation, index) => {
                    if (index === 1) {
                        labelLocation.label = shuffledLabels[index]
                    } else if (Math.random() > .5) {
                        labelLocation.label = shuffledLabels[index]
                    } else {
                        labelLocation.label = ''
                    }
                })

            }

            sketch.draw = () => {
                sketch.colorMode(sketch.HSL)
                sketch.background(255)
                sketch.stroke('none')
                sketch.fill('black')

                this.labelLocations.forEach(labelLocation => {
                    sketch.text(labelLocation.label, labelLocation.x * 60, (labelLocation.y + 1) * 60)
                })

                this.nodeArray.forEach(node => node.determineColor())
                this.nodeArray.forEach(node => node.drawCxn(sketch))
                this.nodeArray.forEach(node => node.drawEllipse(sketch))
                this.activations.forEach(activation => activation.cycle(sketch))
            }
        })

    }
}
</script>
<style lang="scss" scoped="">
#toolTip {
    position: fixed;
    bottom: 45px;
    left: 20px;
    font-weight: 100;
}

#canvas {
    margin: 0 auto;
    display: block;
    width: 1200px;
    height: 720px;
}

#buttons {
    position: absolute;
    right: 20px;
    top: 110px;
    .button {
        cursor: pointer;
        font-size: 22px;
        font-weight: 300;
        margin-bottom: 20px;
        border: 1px solid white;
    }
    .button:hover {
        border-bottom: 1px solid black;
    }
}

#intentions {
    position: relative;
    top: -40px;
    left: 20px;
    p {
        margin: 0px 0px 25px 0px
    }
}

#logo {
    position: fixed;
    bottom: 20px;
    right: 20px;
    opacity: 0.5;
}

#logo:hover {
    opacity: 1;
}

#modal {
    cursor: default !important;
    padding: 10px;
    overflow: auto;
    height: 280px;
    label {
        font-size: 18px;
        font-weight: 900;
    }
    p {
        font-size: 16px;
    }
    .viewToggle {
        font-size: 10px;
        margin-left: 10px;
        border: 1px solid;
        padding: 2px;
        position: relative;
        top: -3px;
        cursor: pointer;
    }
}
</style>