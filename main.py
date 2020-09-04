# Number of minutes remaining scrolls on the screen
# Initially, buzzer is sounding: press A to silence buzzer
# Press A again to start a work timer
# When work timer expires, buzzer sounds
# Press button A to silence the buzzer and reset the servo 
# Press A again to start a break timer
# When break timer expires, buzzer sounds
# Press button A to silence the buzzer 
# Press A again to start another work timer

# Define constants
WORK_TIMER_LENGTH = 20
WORK_TIMER_SERVO_MODULO = 2
BREAK_TIMER_LENGTH = 5
BREAK_TIMER_SERVO_MODULO = 1
MAX_SERVO_ANGLE = 180
TIME_STEP = 1000  # increment that the timer uses
# Initialise variables
time_left = 0
is_work_timer = False  # Will switch to start with work timer after pressing A
alarm_active = True
servo_angle = 180  # 0 <= servo_angle <= 180

def display():
    previous_time_left = -1
    while True:
        if time_left == 0:
            basic.show_string("!!!", 50) if alarm_active else basic.show_icon(IconNames.ASLEEP)
            basic.pause(50)
        else:
            if time_left != previous_time_left:
                # Only do basic.show_number once per increment to stop it getting out of sync
                basic.show_number(time_left, 30)
                previous_time_left = time_left
            basic.pause(50)

def buzz():
    while True:
        if time_left == 0 and alarm_active:
            pins.digital_write_pin(DigitalPin.P0, 1)
            basic.pause(300)
            pins.digital_write_pin(DigitalPin.P0, 0)
            basic.pause(300)
        else:
            basic.pause(100)

def set_servo():
    servo_modulo = 0
    while True:
        servo_modulo = WORK_TIMER_SERVO_MODULO if is_work_timer else BREAK_TIMER_SERVO_MODULO
        if time_left % servo_modulo == 0:
            pins.servo_write_pin(AnalogPin.P11, servo_angle)
        basic.pause(100)



control.in_background(display)
control.in_background(buzz)
control.in_background(set_servo)

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
        servo_angle = (current_timer_length-time_left)/current_timer_length*180

    if time_left == 0 and not alarm_active:
        servo_angle = 0

basic.forever(main_loop)

def on_button_pressed_a():
    global time_left
    global is_work_timer
    global alarm_active

    if time_left > 0:
        return
    if alarm_active:
        alarm_active = False
        return

    # Triggers when countdown finishes
    if is_work_timer:  # switch to break timer
        is_work_timer = False
        time_left = BREAK_TIMER_LENGTH
    else:  # switch to work timer
        is_work_timer = True
        time_left = WORK_TIMER_LENGTH
    alarm_active = True

input.on_button_pressed(Button.A, on_button_pressed_a)