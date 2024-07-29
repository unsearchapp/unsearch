export function throttleFunction<T extends (...args: any[]) => void>(func: T, limit: number) {
	let lastCalled = new Map<WebSocket, number>();

	return function (this: WebSocket, ...args: any[]) {
		const ws = this;
		const now = Date.now();
		const lastCall = lastCalled.get(ws) || 0;

		if (now - lastCall >= limit) {
			func.apply(ws, args);
			lastCalled.set(ws, now);
		}
	} as T;
}
