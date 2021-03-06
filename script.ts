// Rozhranie policka
interface Tile {
    x: number,
    y: number,
    isBomb: boolean
}

let playing = true;

// Funkcie
const rand = <T>(arr: T[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const getAdjanced = (tiles: Tile[], tile: Tile, width: number, height: number) => {
    const adjanced: Tile[] = [];

    /* Vlavo hore  */ if(tile.x > 0 && tile.y > 0) adjanced.push(tiles.find(t => t.x === tile.x - 1 && t.y === tile.y - 1)!);
    /* Hore        */ if(tile.y > 0) adjanced.push(tiles.find(t => t.x === tile.x && t.y === tile.y - 1)!);
    /* Vpravo hore */ if(tile.x < (width - 1) && tile.y > 0) adjanced.push(tiles.find(t => t.x === tile.x + 1 && t.y === tile.y - 1)!);
    /* Vlavo       */ if(tile.x > 0) adjanced.push(tiles.find(t => t.x === tile.x - 1 && t.y === tile.y)!);
    /* Vpravo      */ if(tile.x < (width - 1)) adjanced.push(tiles.find(t => t.x === tile.x + 1 && t.y === tile.y)!);
    /* Vlavo dole  */ if(tile.x > 0 && tile.y < (height - 1)) adjanced.push(tiles.find(t => t.x === tile.x - 1 && t.y === tile.y + 1)!);
    /* Dole        */ if(tile.y < (height - 1)) adjanced.push(tiles.find(t => t.x === tile.x && t.y === tile.y + 1)!);
    /* Vpravo dole */ if(tile.x < (width - 1) && tile.y < (height - 1)) adjanced.push(tiles.find(t => t.x === tile.x + 1 && t.y === tile.y + 1)!);

    return adjanced;
}

const has = (button: (HTMLButtonElement), className: string) => {
    return button.classList.contains(className);
}

const clicked = (button: HTMLButtonElement, width: number, height: number, bombAmount: number) => {
    if(!playing) return;
    if(!button.id.includes(",")) return;
    if(has(button, "flag")) return;

    const [x, y] = button.id.split(",");

    const tile = tiles.find(t => t.x === Number(x) && t.y === Number(y));
    if(!tile) return;

    const adjanced = getAdjanced(tiles, tile, width, height);

    if(button.classList.contains("clicked")) {
        if(tile.isBomb) return;
        if(button.innerHTML === "&nbsp;") return;

        const flags = adjanced.filter(t => has(document.getElementById(`${t.x},${t.y}`) as HTMLButtonElement, "flag"));
        if(Number(button.innerHTML) === flags.length) {
            for(const adjancedTile of adjanced.filter(t => !has(document.getElementById(`${t.x},${t.y}`) as HTMLButtonElement, "flag") && !document.getElementById(`${t.x},${t.y}`)!.classList.contains("clicked"))) {
                const adjancedButton = document.getElementById(`${adjancedTile.x},${adjancedTile.y}`) as HTMLButtonElement;
                clicked(adjancedButton, width, height, bombAmount);
            }
        }
    } else {
        button.classList.add("clicked");

        if(tile.isBomb) {
            // if([...document.getElementById("game")!.getElementsByTagName("button")].filter(btn => has(btn as HTMLButtonElement, "clicked")).length === 1) {
            //     document.getElementById("game")!.querySelectorAll("*").forEach(n => n.remove());
            //     generate(tile);
            //     return;
            // }

            playing = false;
            button.classList.add("bomb");
            alert("Prehral si!");
        } else {
            let bombsAround = adjanced.filter(t => t.isBomb).length;

            if(bombsAround) {
                let clr = "";
                switch(bombsAround) {
                    case 1:
                        clr = "#0807C5";
                        break;
                    case 2:
                        clr = "#028001";
                        break;
                    case 3:
                        clr = "#FE0001";
                        break;
                    case 4:
                        clr = "#000182";
                        break;
                    case 5:
                        clr = "#810103";
                        break;
                    case 6:
                        clr = "#008080";
                        break;
                    case 7:
                        clr = "#000000";
                        break;
                    case 8:
                        clr = "#808080";
                        break;
                    default:
                        clr = "#FFFFFF";
                }

                button.style.color = clr;
                button.innerHTML = String(bombsAround);

                if([...document.getElementById("game")!.getElementsByTagName("button")].filter(btn => !has(btn as HTMLButtonElement, "clicked")).length === bombAmount) {
                    playing = false;
                    alert("Vyhral si!");
                }
            } else {
                for(const adjancedTile of adjanced.filter(t => !document.getElementById(`${t.x},${t.y}`)!.classList.contains("clicked"))) {
                    const adjancedButton = document.getElementById(`${adjancedTile.x},${adjancedTile.y}`) as HTMLButtonElement;
                    clicked(adjancedButton, width, height, bombAmount);
                }
            }
        }
    }
}

const flagged = (button: HTMLButtonElement) => {
    if(!playing) return;
    if(button.classList.contains("clicked")) return;

    if(has(button, "flag")) {
        button.classList.remove("flag");
    } else {
        if(!has(button, "bomb")) {
            button.classList.add("flag");
        }
    }
}

// Konstanty
const tiles: Tile[] = [];

const generate = (onload = false, lastClicked?: Tile) => {
    if(!onload) return location.reload();
    playing = true;

    const width = Number((document.getElementById("width") as HTMLInputElement).value);
    const height = Number((document.getElementById("height") as HTMLInputElement).value);
    const bombAmount = Number((document.getElementById("bombAmount") as HTMLInputElement).value);

    // Inicializacia pola
    for(let i = 0; i < height; ++i) {
        for(let j = 0; j < width; ++j) {
            tiles.push({
                x: j,
                y: i,
                isBomb: false
            });
        }
    }

    // Vytvorenie bomb
    for(let i = 0; i < bombAmount; ++i) {
        let random = rand(tiles.filter(t => !t.isBomb));
        tiles[tiles.findIndex(t => t.x === random.x && t.y === random.y)].isBomb = true;
    }

    // Pridanie pola do HTML
    let i = 0;

    const gameDiv = document.getElementById("game")!;

    for(const tile of tiles) {
        const button = document.createElement("button");

        button.id = `${tile.x},${tile.y}`;
        button.innerHTML = "&nbsp;";

        button.onclick = (e) => clicked(<HTMLButtonElement> e.target, width, height, bombAmount);
        button.addEventListener("contextmenu", (e) => { 
            flagged(<HTMLButtonElement> e.target);
            e.preventDefault(); 
        }, false);

        gameDiv.appendChild(button);

        if(++i / width === 1) {
            gameDiv.appendChild(document.createElement("br"));
            i = 0;
        }
    }

    if(lastClicked) {
        clicked(document.getElementById(`${lastClicked.x},${lastClicked.y}`) as HTMLButtonElement, width, height, bombAmount);
    }
}