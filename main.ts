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
let alarm_melody_started = false
music.setTempo(108)
let alarm_melody = ["G4:2", "D#4:2", "A#3:1", "A#3:1", "A#3:2", "F4:2", "D#4:3", "R:1", "R:2", "G4:1", "G4:1", "G4:1", "G4:1", "G4:1", "G#4:1", "G4:1", "R:1", "G4:1", "G4:1", "G4:1", "G4:1", "G4:1", "G#4:1", "G4:1", "R:1"]
let half_alert = ["D#5:2", "R:4", "A#4:2", "R:8"]
let one_fifth_alert = ["G4:2", "R:4", "G#4:2", "R:8"]
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

control.inBackground(function set_volume() {
    let analog_read: number;
    let raw_volume: number;
    let volume: number;
    while (true) {
        analog_read = pins.analogReadPin(AnalogPin.P1)
        raw_volume = Math.min(Math.idiv(analog_read, 4), 255)
        volume = raw_volume >= 10 ? raw_volume : 0
        music.setVolume(volume)
        basic.pause(30)
    }
})
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
        if (time_left == Math.idiv(current_timer_length, 2)) {
            music.startMelody(half_alert, MelodyOptions.Once)
        }
        
        if (time_left == Math.idiv(current_timer_length, 5)) {
            music.startMelody(one_fifth_alert, MelodyOptions.Once)
        }
        
    }
    if (time_left == 0 && !alarm_melody_started) {
        music.startMelody(alarm_melody, MelodyOptions.Forever)
        alarm_melody_started = true
    }
    
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    
    
    
    if (time_left > 0) {
        return
    }
    
    //  Below this point timer has finished, in either alarm or setting mode
    if (alarm_active) {
        //  Alarm mode > settings mode
        alarm_active = false
        is_work_timer = !is_work_timer
        //  Switch timer
        music.stopMelody(MelodyStopOptions.All)
    } else {
        //  Settings mode > start timer
        time_left = is_work_timer ? WORK_TIMER_LENGTH : BREAK_TIMER_LENGTH
        alarm_active = true
        alarm_melody_started = false
    }
    
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
