

// Test puzzles
var test1 = "003020600900305001001806400008102900700000008006708200002609500800203009005010300";
var easy2 = "007200000400000005010030060000508000008060200000107000030070090200000004006312700";
var test2 = "400000805030000000000700000020000060000080400000010000000603070500200000104000000";
var test4 = "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......";
var test3 = "52...6.........7.13...........4..8..6......5...........418.........3..2...87.....";

// Hold the initial parsed puzzle
var grid = {};

// Parse the given string representing a puzzle into a hash map
function parseGrid (test) {
    var testCount = 0;

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var digit = test.charAt(testCount);
            if (digit == "0" || digit == ".") {
                grid["" + i + j] = "123456789";
            } else {
                grid["" + i + j] = digit;
            }

            ++testCount;
        }
    }
}

// propagate constraints from given position
//      pos: position of the grid to propagate as a string
//      return true if puzzle is valid, false if not
function eliminateValues(grid, pos) {
    if (grid[pos].length == 0) return false;

    if (grid[pos].length == 1){ // eliminate this value from other positions
        var num = grid[pos];
        var row = pos.charAt(0);
        var col = pos.charAt(1);

        // go through row and column
        for (var i = 0; i < 9; i++) {
            if (grid[row + i].length > 1) {
                grid[row + i] = grid[row + i].replace(num, ""); // remove the number from the possible values
                if (grid[row + i].length == 1) { // propagate if there is only 1 value in the pos
                    var valid = eliminateValues(grid, row + i);
                    if (!valid) return false;
                }
            } else if (row + i != pos && grid[row + i] == num) { // check if invalid grid
                //console.log('trying to eliminate row ' + pos + " " + row + i + " " + num);
                return false;
            }

            if (grid[i + col].length > 1) {
                grid[i + col] = grid[i + col].replace(num, "");
                if (grid[i + col].length == 1) {
                    var valid = eliminateValues(grid, i + col);
                    if (!valid) return false;
                }
            } else if (i + col != pos && grid[i + col] == num) {
                //console.log('trying to eliminate col ' + pos + " " + i + col + " " + num);
                return false;
            }
        }

        var unitRow = Math.floor(parseInt(row)/3) * 3;
        var unitCol = Math.floor(parseInt(col)/3) * 3;
        // go through the 9 unit positions
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                var newRow = unitRow + j;
                var newCol = unitCol + k;
                var newPos = "" + newRow + newCol;

                if (grid[newPos].length > 1) {
                    grid[newPos] = grid[newPos].replace(num, "");
                    if (grid[newPos].length == 1) {
                        var valid = eliminateValues(grid, newPos);
                        if (!valid) return false;
                    }
                } else if (newPos != pos && grid[newPos] == num) {
                    //console.log('trying to eliminate unit ' + pos + " " + newPos + " " + num);
                    return false;
                }
            }
        }
    }

    return true;
}

// check if there is only 1 possible value for this position
function eliminate2 (grid, pos) {
    if (grid[pos].length > 1) {
        var nums = grid[pos];
        var numsLen = nums.length;
        var row = pos.charAt(0);
        var col = pos.charAt(1);

        // go through each possible value for the position
        checking_values:
        for (var numIndex = 0; numIndex < numsLen; numIndex++) {
            var num = nums.charAt(numIndex);
            var replace = true;
            if (grid[pos].length == 1) replace = false;
            // go through row
            for (var i = 0; i < 9; i++) {
                if (i != col) { // if this isn't the current position
                    if (grid[row + i].includes(num)) {
                        if (grid[row + i].length == 1) {
                            console.log("checking row " + pos + " " + row + i + " " + num);
                            return false; // invalid row
                        }

                        replace = false;
                        break;
                    }
                }
            }

            // go through col
            for (var i = 0; i < 9; i++) {
                if (i != row) { // if this isn't the current position
                    if (grid[i + col].includes(num)) {
                        if (grid[i + col].length == 1) {
                            console.log("checking col " + i + col + " " + num);
                            return false; // invalid column
                        }

                        replace = false;
                        break;
                    }
                }
            }

            var unitRow = Math.floor(parseInt(row)/3) * 3;
            var unitCol = Math.floor(parseInt(col)/3) * 3;

            //console.log(".");
            // go through the 9 unit positions
            outer_loop:
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    var newRow = unitRow + j;
                    var newCol = unitCol + k;
                    var newPos = "" + newRow + newCol;
                    //console.log("" + unitRow + unitCol + " " + newPos);
                    if (newPos != pos) {
                        if (grid[newPos].includes(num)) {
                            if (grid[newPos].length == 1) {
                                console.log("checking unit " + newPos + " " + num);
                                return false; // invalid unit
                            }

                            replace = false;
                            break outer_loop; // break nested loop
                        }
                    }
                }
            }

            if (replace) {
                grid[pos] = num;
                var valid = eliminateValues(grid, pos); // propagate values from this new single value position
                if (!valid) return false;
                //valid = eliminate2(grid, pos);
                //if (!valid) return false;
                break checking_values;
            }
        }
    }

     return true;
}

// FINAL WORKING FUNCTION
// Go through the given grid and check if values solve the puzzle
//  Return false if grid is not solved, and return the grid if it is solved
function searchGrid(grid) {
    if (solved(grid)) {
        console.log("Solved!");
        return grid;
    } else {
        // get the next empty position with fewest possible values
        // this is to go through the fewest possibilities
        var next = "";
        for (pos in grid) {
            if (grid[pos].length > 1) { // if position is empty
                if (next == "") {
                    next = pos;
                } else if (grid[pos].length < grid[next].length) { // if current position has fewer possible values
                    next = pos;
                }
            }
        }

        var possibleValues = grid[next];
        var len = possibleValues.length;
        // go through each possible value and see if it solves the puzzle
        for (var i = 0; i < len; i++) {
            // make a new copy of the grid
            var newGrid = {};
            for (p in grid) {
                newGrid[p] = grid[p];
            }

            newGrid[next] = possibleValues.charAt(i); // put next possible value into position
            var valid = eliminateValues(newGrid, next); // propogate constraints
            if (valid) valid = eliminate2(newGrid, next);

            // if grid is valid, continue checking other positions
            if (valid) {
                //outGrid(newGrid);
                valid = searchGrid(newGrid);
                if (typeof valid != "boolean") return valid; // success
            }
            // revert position
        }
    }

    return false;
}

// return true if newGrid is solved, false if not
function solved(newGrid) {
    for (pos in newGrid) {
        if (newGrid[pos].length > 1) {
            return false;
        }
    }

    return true;
}


// output the sudoku grid to console
function outGrid(grid) {
    console.log(" ");
    for (var i = 0; i < 9; i++) {
        var out = "";
        for (var j = 0; j < 9; j++) {
            out += grid["" + i + j];
            out += " ";
        }

        console.log(out);
    }
}


// TESTING
var starttime = Date.now();

parseGrid(test4); // PLACE PUZZLE HERE TO TEST

// Propogate constraints
for (pos in grid) {
    if (!eliminateValues(grid, pos)) console.log("Invalid grid");
}

for (pos in grid) {
    if (!eliminate2(grid, pos)) {
        console.log("Invalid grid");
    }
}
outGrid(grid); // output parsed grid

// Solve puzzle
var newGrid = grid;
newGrid = searchGrid(grid);
var endtime = Date.now();
if (typeof newGrid == 'boolean') console.log('Could not find solution, grid may be invalid');
outGrid(newGrid);
console.log(endtime - starttime);

