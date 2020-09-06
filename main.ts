//  Number of minutes remaining scrolls on the screen
//  Initially, buzzer is sounding: press A to silence buzzer
//  Press A again to start a work timer
//  When work timer expires, buzzer sounds
//  Press button A to silence the buzzer and reset the servo 
//  Press A again to start a break timer
//  When break timer expires, buzzer sounds
//  Press button A to silence the buzzer 
//  Press A again to start another work timer
//  Define constants
let MIN_WORK_TIMER_LENGTH = 25
let MAX_WORK_TIMER_LENGTH = 60
let MIN_BREAK_TIMER_LENGTH = 5
let MAX_BREAK_TIMER_LENGTH = 30
let TIME_STEP = 1000
//  increment that the timer uses, in ms
//  Initialise variables
let WORK_TIMER_LENGTH = 25
let BREAK_TIMER_LENGTH = 5
let time_left = 0
let is_work_timer = false
//  Will switch to start with work timer after pressing A
let alarm_active = true
function plot_on_column(number: number, column_index: number) {
    if (number <= 0 || number >= 6) {
        return
    }
    
    for (let y = 0; y < number; y++) {
        led.plot(column_index, y)
    }
}

function plot_number_on_grid(number: number) {
    /** 
    Use left 2 columns to plot the tens digit
    Use right 2 columns to plot the ones digit
    
 */
    basic.clearScreen()
    if (number == 0) {
        return
    }
    
    let tens_digit = Math.idiv(number, 10)
    let ones_digit = number % 10
    plot_on_column(Math.min(tens_digit, 5), 0)
    plot_on_column(tens_digit - 5, 1)
    plot_on_column(Math.min(ones_digit, 5), 3)
    plot_on_column(ones_digit - 5, 4)
}

control.inBackground(function display() {
    let previous_time_left = -1
    while (true) {
        if (time_left == 0) {
            if (alarm_active) {
                basic.showString("!!!", 50)
            } else {
                plot_number_on_grid(is_work_timer ? WORK_TIMER_LENGTH : BREAK_TIMER_LENGTH)
            }
            
            basic.pause(50)
        } else {
            if (time_left != previous_time_left) {
                //  Only do basic.show_number once per increment to stop it getting out of sync
                //  basic.show_number(time_left, 30)
                plot_number_on_grid(time_left)
                previous_time_left = time_left
            }
            
            basic.pause(50)
        }
        
    }
})
control.inBackground(function buzz() {
    while (true) {
        if (time_left == 0 && alarm_active) {
            pins.digitalWritePin(DigitalPin.P0, 1)
            basic.pause(300)
            pins.digitalWritePin(DigitalPin.P0, 0)
            basic.pause(300)
        } else {
            basic.pause(100)
        }
        
    }
})
basic.forever(function main_loop() {
    let current_timer_length: number;
    
    if (is_work_timer) {
        current_timer_length = WORK_TIMER_LENGTH
    } else {
        current_timer_length = BREAK_TIMER_LENGTH
    }
    
    while (time_left > 0) {
        //  Do a time step
        basic.pause(TIME_STEP)
        time_left -= 1
    }
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    
    
    if (time_left > 0) {
        return
    }
    
    if (alarm_active) {
        alarm_active = false
        is_work_timer = !is_work_timer
        //  Switch timer
        return
    }
    
    //  Triggers when countdown finishes
    time_left = is_work_timer ? WORK_TIMER_LENGTH : BREAK_TIMER_LENGTH
    alarm_active = true
})
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    /** Change timer length */
    
    
    if (time_left > 0 || alarm_active) {
        return
    }
    
    if (is_work_timer) {
        WORK_TIMER_LENGTH += 5
        if (WORK_TIMER_LENGTH > MAX_WORK_TIMER_LENGTH) {
            WORK_TIMER_LENGTH = MIN_WORK_TIMER_LENGTH
        }
        
    } else {
        BREAK_TIMER_LENGTH += 5
        if (BREAK_TIMER_LENGTH > MAX_BREAK_TIMER_LENGTH) {
            BREAK_TIMER_LENGTH = MIN_BREAK_TIMER_LENGTH
        }
        
    }
    
})
