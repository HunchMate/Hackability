class LogoLoop {
  constructor(element, options = {}) {
    this.container = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.container) return;

    this.options = {
      logos: [],
      speed: 120,
      direction: 'left',
      width: '100%',
      logoHeight: 48,
      gap: 32,
      pauseOnHover: false,
      hoverSpeed: 0,
      fadeOut: false,
      fadeOutColor: undefined,
      scaleOnHover: false,
      ariaLabel: 'Partner logos',
      ...options
    };

    this.ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

    this.isVertical = this.options.direction === 'up' || this.options.direction === 'down';
    this.isHovered = false;
    this.copyCount = this.ANIMATION_CONFIG.MIN_COPIES;
    this.seqWidth = 0;
    this.seqHeight = 0;
    
    this.offset = 0;
    this.velocity = 0;
    this.lastTimestamp = null;
    this.rafId = null;
    
    this.effectiveHoverSpeed = this.options.hoverSpeed !== undefined ? this.options.hoverSpeed : (this.options.pauseOnHover ? 0 : undefined);
    
    const magnitude = Math.abs(this.options.speed);
    let directionMultiplier = 1;
    if (this.isVertical) {
      directionMultiplier = this.options.direction === 'up' ? 1 : -1;
    } else {
      directionMultiplier = this.options.direction === 'left' ? 1 : -1;
    }
    const speedMultiplier = this.options.speed < 0 ? -1 : 1;
    this.targetVelocity = magnitude * directionMultiplier * speedMultiplier;

    this.initDOM();
    this.attachEvents();
    this.startAnimation();
  }

  initDOM() {
    this.container.classList.add('logoloop');
    if (this.isVertical) this.container.classList.add('logoloop--vertical');
    else this.container.classList.add('logoloop--horizontal');
    if (this.options.fadeOut) this.container.classList.add('logoloop--fade');
    if (this.options.scaleOnHover) this.container.classList.add('logoloop--scale-hover');
    
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', this.options.ariaLabel);

    this.container.style.setProperty('--logoloop-gap', `${this.options.gap}px`);
    this.container.style.setProperty('--logoloop-logoHeight', `${this.options.logoHeight}px`);
    if (this.options.fadeOutColor) {
      this.container.style.setProperty('--logoloop-fadeColor', this.options.fadeOutColor);
    }
    this.container.style.width = typeof this.options.width === 'number' ? `${this.options.width}px` : this.options.width;

    this.track = document.createElement('div');
    this.track.className = 'logoloop__track';
    this.container.innerHTML = '';
    this.container.appendChild(this.track);

    this.renderCopies();
  }

  renderCopies() {
    this.track.innerHTML = '';
    for (let i = 0; i < this.copyCount; i++) {
      const ul = document.createElement('ul');
      ul.className = 'logoloop__list';
      ul.setAttribute('role', 'list');
      if (i > 0) ul.setAttribute('aria-hidden', 'true');
      if (i === 0) this.seqRef = ul;

      this.options.logos.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'logoloop__item';
        li.setAttribute('role', 'listitem');
        
        const content = item.src 
          ? `<img src="${item.src}" alt="${item.alt || item.title || ''}" loading="lazy" />`
          : `<span class="logoloop__node">${item.node}</span>`;
          
        if (item.href && item.href !== '#') {
          const a = document.createElement('a');
          a.className = 'logoloop__link';
          a.href = item.href;
          a.target = '_blank';
          a.rel = 'noreferrer noopener';
          a.setAttribute('aria-label', item.alt || item.title || 'logo link');
          a.innerHTML = content;
          li.appendChild(a);
        } else {
          li.innerHTML = content;
        }

        ul.appendChild(li);
      });

      this.track.appendChild(ul);
    }
    
    // Once images are loaded, update dimensions
    const images = this.seqRef.querySelectorAll('img');
    if (images.length === 0) {
      this.updateDimensions();
    } else {
      let remaining = images.length;
      images.forEach(img => {
        if (img.complete) {
          remaining--;
          if (remaining === 0) this.updateDimensions();
        } else {
          img.addEventListener('load', () => {
            remaining--;
            if (remaining === 0) this.updateDimensions();
          }, { once: true });
          img.addEventListener('error', () => {
            remaining--;
            if (remaining === 0) this.updateDimensions();
          }, { once: true });
        }
      });
    }
  }

  updateDimensions() {
    if (!this.seqRef) return;
    
    const containerWidth = this.container.clientWidth;
    const sequenceRect = this.seqRef.getBoundingClientRect();
    const sequenceWidth = sequenceRect.width;
    const sequenceHeight = sequenceRect.height;
    
    let copiesNeeded = this.ANIMATION_CONFIG.MIN_COPIES;
    
    if (this.isVertical) {
      const parentHeight = this.container.parentElement ? this.container.parentElement.clientHeight : 0;
      if (parentHeight > 0) {
        this.container.style.height = `${Math.ceil(parentHeight)}px`;
      }
      if (sequenceHeight > 0) {
        this.seqHeight = Math.ceil(sequenceHeight);
        const viewport = this.container.clientHeight || parentHeight || sequenceHeight;
        copiesNeeded = Math.ceil(viewport / sequenceHeight) + this.ANIMATION_CONFIG.COPY_HEADROOM;
      }
    } else if (sequenceWidth > 0) {
      this.seqWidth = Math.ceil(sequenceWidth);
      copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + this.ANIMATION_CONFIG.COPY_HEADROOM;
    }
    
    copiesNeeded = Math.max(this.ANIMATION_CONFIG.MIN_COPIES, copiesNeeded);
    
    if (copiesNeeded !== this.copyCount) {
      this.copyCount = copiesNeeded;
      this.renderCopies();
    }
  }

  attachEvents() {
    if (this.effectiveHoverSpeed !== undefined) {
      this.track.addEventListener('mouseenter', () => this.isHovered = true);
      this.track.addEventListener('mouseleave', () => this.isHovered = false);
    }

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => this.updateDimensions());
      });
      this.resizeObserver.observe(this.container);
      if (this.seqRef) this.resizeObserver.observe(this.seqRef);
    } else {
      this.resizeListener = () => this.updateDimensions();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  startAnimation() {
    const animate = (timestamp) => {
      if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
      const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const target = (this.isHovered && this.effectiveHoverSpeed !== undefined) ? this.effectiveHoverSpeed : this.targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / this.ANIMATION_CONFIG.SMOOTH_TAU);
      this.velocity += (target - this.velocity) * easingFactor;

      const seqSize = this.isVertical ? this.seqHeight : this.seqWidth;

      if (seqSize > 0) {
        let nextOffset = this.offset + this.velocity * deltaTime;
        nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
        this.offset = nextOffset;

        const transformValue = this.isVertical
          ? `translate3d(0, ${-this.offset}px, 0)`
          : `translate3d(${-this.offset}px, 0, 0)`;
        this.track.style.transform = transformValue;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    this.container.innerHTML = '';
  }
}

window.LogoLoop = LogoLoop;
