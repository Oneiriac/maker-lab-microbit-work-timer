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
MIN_WORK_TIMER_LENGTH = 25
MAX_WORK_TIMER_LENGTH = 60
MIN_BREAK_TIMER_LENGTH = 5
MAX_BREAK_TIMER_LENGTH = 30
TIME_STEP = 1000  # increment that the timer uses, in ms
# Initialise variables
WORK_TIMER_LENGTH = 25
BREAK_TIMER_LENGTH = 5
time_left = 0
is_work_timer = False  # Will switch to start with work timer after pressing A
alarm_active = True

def plot_on_column(number, column_index):
    if number <= 0 or number >= 6:
        return
    for y in range(0, number):
        led.plot(column_index, y)

def plot_number_on_grid(number):
    """
    Use left 2 columns to plot the tens digit
    Use right 2 columns to plot the ones digit
    """
    basic.clear_screen()
    if number == 0:
        return
    tens_digit = number // 10
    ones_digit = number % 10

    plot_on_column(min(tens_digit, 5), 0)
    plot_on_column(tens_digit-5, 1)
    plot_on_column(min(ones_digit, 5), 3)
    plot_on_column(ones_digit-5, 4)

def display():
    previous_time_left = -1
    while True:
        if time_left == 0:
            if alarm_active:
                basic.show_string("!!!", 50)
            else:
                plot_number_on_grid(WORK_TIMER_LENGTH if is_work_timer else BREAK_TIMER_LENGTH)
            basic.pause(50)
        else:
            if time_left != previous_time_left:
                # Only do basic.show_number once per increment to stop it getting out of sync
                # basic.show_number(time_left, 30)
                plot_number_on_grid(time_left)
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


control.in_background(display)
control.in_background(buzz)

def main_loop():
    global time_left
    if is_work_timer:
        current_timer_length = WORK_TIMER_LENGTH
    else:
        current_timer_length = BREAK_TIMER_LENGTH

    while time_left > 0:
        # Do a time step
        basic.pause(TIME_STEP)
        time_left -= 1
        
basic.forever(main_loop)

def on_button_pressed_a():
    global time_left
    global is_work_timer
    global alarm_active

    if time_left > 0:
        return
    if alarm_active:
        alarm_active = False
        is_work_timer = not is_work_timer  # Switch timer
        return

    # Triggers when countdown finishes
    time_left = WORK_TIMER_LENGTH if is_work_timer else BREAK_TIMER_LENGTH
    alarm_active = True

input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    """Change timer length"""
    global WORK_TIMER_LENGTH
    global BREAK_TIMER_LENGTH
    if time_left > 0 or alarm_active:
        return
    
    if is_work_timer:
        WORK_TIMER_LENGTH += 5
        if WORK_TIMER_LENGTH > MAX_WORK_TIMER_LENGTH:
            WORK_TIMER_LENGTH = MIN_WORK_TIMER_LENGTH
    else:
        BREAK_TIMER_LENGTH += 5
        if BREAK_TIMER_LENGTH > MAX_BREAK_TIMER_LENGTH:
            BREAK_TIMER_LENGTH = MIN_BREAK_TIMER_LENGTH

input.on_button_pressed(Button.B, on_button_pressed_b)