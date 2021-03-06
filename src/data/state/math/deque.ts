/**
	* Copyright (c) 2013 Petka Antonov
	*
	* Permission is hereby granted, free of charge, to any person obtaining a copy
	* of this software and associated documentation files (the "Software"), to deal
	* in the Software without restriction, including without limitation the rights
	* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the Software is
	* furnished to do so, subject to the following conditions:</p>
	*
	* The above copyright notice and this permission notice shall be included in
	* all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
	* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	* THE SOFTWARE.
	*/
'use strict';
export class Deque<T> {
	private _capacity: number;
	private _length: number;
	private _front: number;
	constructor(capacity: number | any[]) {
		this._capacity = this.getCapacity(capacity);
		this._length = 0;
		this._front = 0;
		if (Array.isArray(capacity)) {
			const len = capacity.length;
			for (let i = 0; i < len; ++i) {
				this[i] = capacity[i];
			}
			this._length = len;
		}
	}
	private getCapacity(capacity: number | any[]) {
		if (typeof capacity !== 'number') {
			if (Array.isArray(capacity)) {
				capacity = capacity.length;
			} else {
				return 16;
			}
		}
		return this.pow2AtLeast(
			Math.min(Math.max(16, capacity), 1073741824)
		);
	}
	public toArray(): T[] {
		const len = this._length;
		const ret = new Array(len);
		const front = this._front;
		const capacity = this._capacity;
		for (let j = 0; j < len; ++j) {
			ret[j] = this[(front + j) & (capacity - 1)];
		}
		return ret;
	}
	public push(item: T): number {
		const argsLength = arguments.length;
		let length = this._length;
		if (argsLength > 1) {
			const capacity = this._capacity;
			if (length + argsLength > capacity) {
				for (let i = 0; i < argsLength; ++i) {
					this._checkCapacity(length + 1);
					const j = (this._front + length) & (this._capacity - 1);
					this[j] = arguments[i];
					length++;
					this._length = length;
				}
				return length;
			} else {
				let j = this._front;
				for (let i = 0; i < argsLength; ++i) {
					this[(j + length) & (capacity - 1)] = arguments[i];
					j++;
				}
				this._length = length + argsLength;
				return length + argsLength;
			}
		}
		if (argsLength === 0) {
			return length;
		}
		this._checkCapacity(length + 1);
		const x = (this._front + length) & (this._capacity - 1);
		this[x] = item;
		this._length = length + 1;
		return length + 1;
	}
	public pop(): T | undefined {
		const length = this._length;
		if (length === 0) {
			return void 0;
		}
		const i = (this._front + length - 1) & (this._capacity - 1);
		const ret = this[i];
		this[i] = void 0;
		this._length = length - 1;
		return ret;
	}
	public shift(): T | undefined {
		const length = this._length;
		if (length === 0) {
			return void 0;
		}
		const front = this._front;
		const ret = this[front];
		this[front] = void 0;
		this._front = (front + 1) & (this._capacity - 1);
		this._length = length - 1;
		return ret;
	}
	public unshift(item: T): number {
		let length = this._length;
		const argsLength = arguments.length;
		if (argsLength > 1) {
			const cap = this._capacity;
			if (length + argsLength > cap) {
				for (let a = argsLength - 1; a >= 0; a--) {
					this._checkCapacity(length + 1);
					const forcap = this._capacity;
					const j = (((( this._front - 1 ) &
					( forcap - 1) ) ^ forcap ) - forcap );
					this[j] = arguments[a];
					length++;
					this._length = length;
					this._front = j;
				}
				return length;
			} else {
				let front = this._front;
				for (let a = argsLength - 1; a >= 0; a--) {
					const j = (((( front - 1 ) &
					( cap - 1) ) ^ cap ) - cap );
					this[j] = arguments[a];
					front = j;
				}
				this._front = front;
				this._length = length + argsLength;
				return length + argsLength;
			}
		}
		if (argsLength === 0) {
			return length;
		}
		this._checkCapacity(length + 1);
		const capacity = this._capacity;
		const i = (((( this._front - 1 ) &
		( capacity - 1) ) ^ capacity ) - capacity );
		this[i] = item;
		this._length = length + 1;
		this._front = i;
		return length + 1;
	}
	public peekBack(): T | undefined {
		const length = this._length;
		if (length === 0) {
			return void 0;
		}
		const index = (this._front + length - 1) & (this._capacity - 1);
		return this[index];
	}
	public peekFront(): T | undefined {
		if (this._length === 0) {
			return void 0;
		}
		return this[this._front];
	}
	public get(index: number): T | undefined {
		let i = index;
		if ((i !== (i | 0))) {
			return void 0;
		}
		const len = this._length;
		if (i < 0) {
			i = i + len;
		}
		if (i < 0 || i >= len) {
			return void 0;
		}
		return this[(this._front + i) & (this._capacity - 1)];
	}
	public isEmpty(): boolean {
		return this._length === 0;
	}
	public clear() {
		const len = this._length;
		const front = this._front;
		const capacity = this._capacity;
		for (let j = 0; j < len; ++j) {
			this[(front + j) & (capacity - 1)] = void 0;
		}
		this._length = 0;
		this._front = 0;
	}
	public toString(): string {
		return this.toArray().toString();
	}
	public valueOf = this.toString;
	public removeFront = this.shift;
	public removeBack = this.pop;
	public insertFront = this.unshift;
	public insertBack = this.push;
	public enqueue = this.push;
	public dequeue = this.shift;
	public toJSON = this.toArray;
	get length() {
		return this._length;
	}
	set length(val) {
		throw new RangeError('');
	}
	private _checkCapacity(size: number) {
		if (this._capacity < size) {
			this._resizeTo(this.getCapacity(this._capacity * 1.5 + 16));
		}
	}
	private _resizeTo(capacity: number) {
		const oldCapacity = this._capacity;
		this._capacity = capacity;
		const front = this._front;
		const length = this._length;
		if (front + length > oldCapacity) {
			const moveItemsCount = (front + length) & (oldCapacity - 1);
			this.arrayMove(this, 0, this, oldCapacity, moveItemsCount);
		}
	}
	private arrayMove(src, srcIndex, dst, dstIndex, len) {
		for (let j = 0; j < len; ++j) {
			dst[j + dstIndex] = src[j + srcIndex];
			src[j + srcIndex] = void 0;
		}
	}
	private pow2AtLeast(n) {
		n = n >>> 0;
		n = n - 1;
		n = n | (n >> 1);
		n = n | (n >> 2);
		n = n | (n >> 4);
		n = n | (n >> 8);
		n = n | (n >> 16);
		return n + 1;
	}
}
