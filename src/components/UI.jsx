import React from 'react';
import { Joystick } from 'react-joystick-component';
import { useInputStore } from '../store/inputStore';
import { useGameStore } from '../store/gameStore';

export const UI = () => {
    const { setMove, setLook, setAction } = useInputStore();
    const { inventory, isBuildMode, toggleBuildMode } = useGameStore();

    const handleMove = (e) => {
        setMove(e.x, e.y);
    };

    const handleStopMove = () => {
        setMove(0, 0);
    };

    const handleLook = (e) => {
        setLook(e.x, e.y);
    };

    const handleStopLook = () => {
        setLook(0, 0);
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Inventory / HUD */}
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace', textShadow: '1px 1px 2px black' }}>
                <h3>STATUS</h3>
                <p>HP: {useGameStore.getState().hp}</p>
                <div style={{ marginTop: 10 }}>
                    <p>Scrap: {inventory.scrap}</p>
                    <p>Wood: {inventory.wood}</p>
                    <p>Water: {inventory.water}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ position: 'absolute', bottom: 120, right: 20, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'auto' }}>
                <button
                    onClick={toggleBuildMode}
                    style={{
                        padding: '15px',
                        borderRadius: '50%',
                        background: isBuildMode ? 'orange' : '#444',
                        color: 'white',
                        border: '2px solid white'
                    }}
                >
                    {isBuildMode ? 'CANCEL' : 'BUILD'}
                </button>

                {isBuildMode && (
                    <button
                        onClick={() => setAction('build', true)}
                        style={{ padding: '15px', borderRadius: '50%', background: '#2ecc71', color: 'white', border: '2px solid white' }}
                    >
                        PLACE
                    </button>
                )}

                <button
                    onClick={() => setAction('attack', true)}
                    style={{ padding: '20px', borderRadius: '50%', background: '#e74c3c', color: 'white', border: '2px solid white', fontWeight: 'bold' }}
                >
                    ATK
                </button>
            </div>

            {/* Save/Load Controls */}
            <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto', display: 'flex', gap: '10px' }}>
                <button onClick={() => useGameStore.getState().saveGame()} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>SAVE</button>
                <button onClick={() => useGameStore.getState().loadGame()} style={{ background: '#9b59b6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>LOAD</button>
            </div>

            {/* Joysticks */}
            <div style={{ position: 'absolute', bottom: 40, left: 40, pointerEvents: 'auto' }}>
                <Joystick
                    size={100}
                    stickSize={60}
                    baseColor="rgba(255, 255, 255, 0.2)"
                    stickColor="rgba(255, 255, 255, 0.5)"
                    move={handleMove}
                    stop={handleStopMove}
                />
            </div>

            <div style={{ position: 'absolute', bottom: 40, right: 40, pointerEvents: 'auto' }}>
                <Joystick
                    size={100}
                    stickSize={60}
                    baseColor="rgba(255, 255, 255, 0.2)"
                    stickColor="rgba(255, 255, 255, 0.5)"
                    move={handleLook}
                    stop={handleStopLook}
                />
            </div>

            {/* Crosshair */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '10px',
                height: '10px',
                background: 'white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.5
            }} />
        </div>
    );
};
