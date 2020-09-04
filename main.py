# def main_loop():
#     pins.analog_write_pin(AnalogPin.P0, 1023)
#     pins.servo_write_pin(AnalogPin.P11, 360)
#     basic.pause(2000)
#     pins.analog_write_pin(AnalogPin.P0, 0)
#     pins.servo_write_pin(AnalogPin.P11, 0)
#     basic.pause(2000)

# basic.forever(main_loop)

# def on_button_pressed_a():
#     basic.show_number(Math.round(Math.random()*10))
# input.on_button_pressed(Button.A, on_button_pressed_a)

# 30 minute timer
# Number of minutes remaining scrolls on the screen
# Servo only has 180 degrees of motion
# ticks along every 5 mins
# When timer expires, buzzer sounds
# press button A for 5 minutes of break and to reset the servo
# During this time the timer ticks along every 1 minute
# When break timer expires, another buzzer
# Press button A to silence the buzzer and to start another 30 minute timer

# Define constants
WORK_TIMER_LENGTH = 30
WORK_TIMER_SERVO_MODULO = 5
BREAK_TIMER_LENGTH = 10
BREAK_TIMER_SERVO_MODULO = 2
MAX_SERVO_ANGLE = 180
TIME_STEP = 1000  # increment that the timer uses

# Initialise variables
time_left = WORK_TIMER_LENGTH
is_work_timer = True
servo_angle = 0  # max 180

def display():
    while True:
        if time_left == 0:
            basic.show_string("!")
            basic.pause(300)
            basic.show_string("")
            basic.pause(300)
        else:
            basic.show_number(time_left)
            basic.pause(100)

control.in_background(display)


def main_loop():
    global time_left
    global servo_angle
    if is_work_timer:
        current_timer_length = WORK_TIMER_LENGTH
        servo_modulo = WORK_TIMER_SERVO_MODULO
    else:
        current_timer_length = BREAK_TIMER_LENGTH
        servo_modulo = BREAK_TIMER_SERVO_MODULO

    while time_left > 0:
        # Do a time step
        basic.pause(TIME_STEP)
        time_left -= 1
        # Servo control
        servo_angle = (current_timer_length-time_left)/current_timer_length*180
        if time_left % servo_modulo == 0:
            pins.servo_write_pin(AnalogPin.P11, servo_angle)

    
    if time_left == 0:
        servo_angle = 0
        pins.servo_write_pin(AnalogPin.P11, servo_angle)

basic.forever(main_loop)

def on_button_pressed_a():
    global time_left
    global is_work_timer
    if time_left > 0:
        return
    if is_work_timer:  # switch to break timer
        is_work_timer = False
        time_left = BREAK_TIMER_LENGTH
    else:
        is_work_timer = True
        time_left = WORK_TIMER_LENGTH

input.on_button_pressed(Button.A, on_button_pressed_a)