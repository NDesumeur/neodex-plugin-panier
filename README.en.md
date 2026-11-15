# Hoop

A pixel art skill game: basketball in 60 seconds in a gym. Aim, shoot, score.

*Version française : [README.md](README.md)*

## Controls

- **Mouse**: click, pull back like a slingshot and release. The further you pull, the stronger the shot.
- **Keyboard**: **← →** for the angle, **↑ ↓** for the power, **Space** to shoot.
- **P** or **Esc**: pause.

## How it works

- The **white dots** show the start of the shot: guess the rest.
- The ball **really bounces** off the rim, the backboard and the floor: a shot off the backboard can still go in.
- A basket is worth **2 points**, **3** behind the line, and **1 more** if it touches nothing.
- **Three baskets in a row**: the player is **ON FIRE** and the next baskets count **double**, until the first miss.
- From **16 points**, the hoop moves up and down; after 40 points, it moves faster.
- The shooter moves after every shot. A shot released before the buzzer still counts.

## The crowd and the golden ball

- After each basket, the **crowd** stands up and jumps in the stands; when you are **ON FIRE**, it stays up, arms raised, and cheers.
- From time to time, the shooter gets a **golden ball** (marked **×3**): its basket is worth **3 times more**, on top of the ON FIRE bonus.

## Full screen

The **Full screen** button fills the whole screen with the court (Escape to leave). Otherwise the game takes all the height the window leaves.

## Stats

The Bests panel keeps your **best score**, the number of **games**, **baskets** and your **longest streak**.

## Data and sync

Your best and totals are saved by NeoDex, backed up and synced between your PCs if sync is on.

## Install

In NeoDex: **NeoStore → Discover → Hoop → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
