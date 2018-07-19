# Spell Template Web App

This tool will hopefully make aiming your spells much easier in Dungeons and Dragons (5th Edition specifically).

It allows you to place an origin (the caster or target point) and point the spells template away from that and view which squares (and enemies!) would be hit. 

This tool is not intended to replace a battle map or any existing electronic tools, but to be a mobile friendly and convenient way to quickly resolve a question of "Can I hit the goblin and the bugbear with a 15ft. cone?" or "Can I cast fireball on the ogre without burning Bruenor?"

[Try it now!](https://sircinnamon.github.io/SpellTemplates/)

## Interface

![Interface](https://i.imgur.com/TeFy602.png)

This is the basic interface to the app! The board is layed out as a familiar battlemap, with a toolbar at the bottom and a settings button near the top. This view is flexible across screens of all sizes! Let's break it down into parts.

### Toolbar

![Toolbar](https://i.imgur.com/FeKBr3x.png)

The toolbar is the first thing you'll likely want to use when you open the app.  It's how you input the parameters of what you need to know. If you're casting Fireball, a 20ft radius sphere centered on a point you choose, you would tap the `+` key to increment the size of the spell, and the circle icon indicating the shape of the spell, on the right.

The `+` and `-` on the left, paired with the text between them indicate the size of the template you'll be placing. This is tied to the spell you are casting and acts differently based on the shape - for a circular spell (spheres and cylinders), it equates to the radius. For lines, it's the length and for cones it's both the height of the triangle as well as the width of the base.

The `man` icon in the middle indicates a Unit. Units allow you to position each creature you want to hit (or not hit) in the game space. While you can just look at what tiles are hit by a spell, it's nice to be able to place all the targets and work from there! When you click this button you will enter Unit Placement Mode, and each Tile you click on will toggle having a Unit or being empty. 

The three icons on the right, the `triangle`, `circle` and `arrow` indicate Cones, Sphere/Cylinders, and Lines respectively. These are the aimable spell shapes in 5th Edition D&D.

Once you've placed your Units and selected the size and shape of your spell, it's time to aim!

### Aiming

![Aiming](https://i.imgur.com/9x5r9DP.png)

Aiming with a circle is easy! Just click on the map where the center of the circle should be! The squares that are hit will light up, and Units that are hit will be marked with a cross. You can also click and drag to move the center with your mouse.

![Cone Aiming](https://i.imgur.com/y4QacMz.png)
![Line Aiming](https://i.imgur.com/utGQnh9.png)

Cones and Lines aim a little differently. Because they need both a starting point and a direction, you cannot srag to move the starting point. Instead, the starting point will be placed by the click and you can drag the mouse around to aim the direction of the spell.

### Locking

In the image of the Cone and Line aimers, you may have noticed there is a circle around the origin pont of the spell. That indicates a Locked Origin. You can double click a point (long press on mobile) to lock in the origin point, which will prevent it from being moved to a new location until it is unlocked. This allows you to release, observe your aiming, and adjust it without having to set the origin point again. While locked, clicking will only chaing the direction of the spell. Just double click or long press anywhere on the grid to unlock.

### Settings

![Settings Button](https://i.imgur.com/aTODDms.png)

In the top right of the window, you'll see this small gear icon. This will open the Settings menu.

![Settings Menu](https://i.imgur.com/wneXi7Z.png)

Among the settings are a `Hit Threshold` slider, which defaults to 50%. This indicates that a spell template must cover 50% of a tile before it is considered to be a hit. You can up this to 100%, if you only want to consider total coverage a hit, or to 1% if any tile touched is considered hit in your game.

There is also an export button. This allows you to share the current state of your board with someone else. Simply click the export button and the text box will be filled with a url encoding the size, shape and position of your spell as well as all units you've placed. When someone else opens the link, they can see just how you want to aim your spell!