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
let WORK_TIMER_LENGTH = 25
let WORK_TIMER_SERVO_MODULO = 2
let BREAK_TIMER_LENGTH = 5
let BREAK_TIMER_SERVO_MODULO = 1
let TIME_STEP = 1000
//  increment that the timer uses
//  Initialise variables
let time_left = 0
let is_work_timer = false
//  Will switch to start with work timer after pressing A
let alarm_active = true
function plot_number_on_grid(number: number) {
    let y: number;
    basic.clearScreen()
    if (number == 0) {
        return
    }
    
    let max_x = Math.idiv(number - 1, 5)
    let max_y = (number - 1) % 5
    //  Plot all LEDs with x < max_x
    for (let x = 0; x < max_x; x++) {
        for (y = 0; y < 5; y++) {
            led.plot(x, y)
        }
    }
    //  Plot LEDs with x == max_x and y <= max_y
    for (y = 0; y < max_y + 1; y++) {
        led.plot(max_x, y)
    }
}

control.inBackground(function display() {
    let previous_time_left = -1
    while (true) {
        if (time_left == 0) {
            alarm_active ? basic.showString("!!!", 50) : basic.showIcon(IconNames.Asleep)
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
        return
    }
    
    //  Triggers when countdown finishes
    if (is_work_timer) {
        //  switch to break timer
        is_work_timer = false
        time_left = BREAK_TIMER_LENGTH
    } else {
        //  switch to work timer
        is_work_timer = true
        time_left = WORK_TIMER_LENGTH
    }
    
    alarm_active = true
})
