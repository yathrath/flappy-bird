import random

# Game dimensions
WIDTH = 400 
HEIGHT = 600
# Bird
bird_x = 100
bird_y = 300
bird_velocity = 0
gravity = 0.5
flap_strenght = -8
#Game
score = 0
game_over = false
def flap():
    global bird_velocity
    bird_velocity = flap_strength
def updates():
    global bird_y
    global bird_velocity
    bird_velocity += gravity
    bird_y += bird_velocity
def get_bird_y ():
        return bird_y

    