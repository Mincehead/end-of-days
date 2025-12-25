import { useEffect } from 'react';
import { useInputStore } from '../store/inputStore';

export const KeyboardControls = () => {
    const { setMove, setLook, setAction } = useInputStore();

    useEffect(() => {
        // Track state of keys
        const keys = { w: false, a: false, s: false, d: false };

        const handleKeys = (e, isDown) => {
            if (e.repeat) return;
            const code = e.code;

            // Map keys
            if (code === 'KeyW' || code === 'ArrowUp') keys.w = isDown;
            if (code === 'KeyS' || code === 'ArrowDown') keys.s = isDown;
            if (code === 'KeyA' || code === 'ArrowLeft') keys.a = isDown;
            if (code === 'KeyD' || code === 'ArrowRight') keys.d = isDown;

            // Resolve vector
            let x = 0;
            let y = 0;
            if (keys.w) y += 1;
            if (keys.s) y -= 1;
            if (keys.d) x += 1;
            if (keys.a) x -= 1;

            useInputStore.getState().setMove(x, y);

            // Actions (Trigger on Down)
            if (isDown) {
                if (code === 'Space') setAction('jump', true);
                if (code === 'KeyF') setAction('attack', true);
                if (code === 'KeyE') setAction('build', true);
            } else {
                if (code === 'Space') setAction('jump', false);
                if (code === 'KeyF') setAction('attack', false);
                if (code === 'KeyE') setAction('build', false);
            }
        };

        const onDown = (e) => handleKeys(e, true);
        const onUp = (e) => handleKeys(e, false);

        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);

        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, []);

    // Mouse Look (Pointer Lock)
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (document.pointerLockElement === document.body) {
                // Determine sensitivity
                const sensitivity = 0.05;
                // Update look state directly (simulating joystick delta)
                // In Player.jsx we consume look.x/y as simple scalars to add to rotation

                // We need to continuously add to rotation in Player.jsx, but joystick returns a "held" value.
                // Mouse returns a "delta". 
                // We might need to adjust Player.jsx to handle Mouse Delta differently than Joystick "Hold".
                // FOR NOW: Let's accept that we just map movement. y-rotation (yaw) is e.movementX

                // A quick hack for the "Joystick" logic in Player.jsx:
                // It treats "look.x" as "how fast to turn". 
                // Mouse movement is instantaneous. 

                useInputStore.getState().setLook(e.movementX * sensitivity, e.movementY * sensitivity);

                // Reset look to 0 shortly after to stop spinning (since mouse stops moving)
                // This is tricky with the current Joystick-centric Player loop.
                setTimeout(() => {
                    useInputStore.getState().setLook(0, 0);
                }, 10);
            }
        };

        const handleClick = () => {
            document.body.requestPointerLock();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return null;
}
