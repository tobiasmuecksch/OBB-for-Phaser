# OBB-for-Phaser
This project is about replacing Phaser.io's Arcade Physics AABB collision detection (which doesn't offer bounding box rotation) with "Oriented bounding box" collision detection or short OBB.

The great benefit: OBB supports rotating bounding boxes!

## Important
This project is in a testing state. Please feel free to add pull requests and issues!

## Usage
- Download the obb.js file from the sources
- Add it to your html right behind phaser, like this:
```
<script type="text/javascript" src="lib/phaser.js"></script>
<script type="text/javascript" src="lib/obb.js"></script>
```
- Then in your game.js add this line in the preload function (I assume you already have started the Arcade physics)
```
OBB.setOBB(this.game);
```

## Debugging
For debugging purposes you can use the OBB.debug object. Currently it only supports drwaing the vertices of bodies.
You can use it like this:
```
render: function () {
    // Standard for the drawn vertices is red
    OBB.debug.drawVertices(this.player.body);
    
    // Or you can set a custom color; blue for example
    // OBB.debug.drawVertices(this.player.body, "0x0000ff");
}
```

## Bower
As soon as this project is stable and safe to use, I will add it to bower.

## License
MIT. See the LICENSE.md file in this repository for more information.

## Use it on your own risk!
Be aware that you use this code on your own risk. The authors of this code won't take any responsibilites for anything.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
