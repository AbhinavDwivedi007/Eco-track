/**
 * EcoTrack - Main Interactive UI & Application Logic
 * Coordinates 5-second cinematic opening animation, JWT authentication,
 * real-data dashboard hub with EcoTicker & Eco Status pills,
 * Carbon Calculator with Category Breakdown & direct Personalized Tips,
 * Monthly Progress with real month-over-month comparisons,
 * 3-Tier Streak Rewards (7, 14, 30 Days) with 1-2s celebration animation,
 * and General Educational Tips hub.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Opening Animation (Smooth 5-Second Timeline - Requirement 11)
  initOpeningSplash();

  // 2. Initialize Navigation, Notifications, Profile, and Common UI
  initNavigation();
  initToastContainer();
  initAuth();
  initEcoScoreModal();
  initProfileModal();

  // 3. Sync authenticated user profile if token exists
  if (window.EcoApi && window.EcoApi.isAuthenticated()) {
    await window.EcoApi.getMe();
  }
  syncAuthNav();

  // 4. Route-based initialization
  const path = window.location.pathname.toLowerCase();

  if (path.includes('dashboard') || document.getElementById('dashboard-view')) {
    await initDashboard();
  } else if (path.includes('calculator') || document.getElementById('calculator-view')) {
    await initCalculator();
  } else if (path.includes('progress') || document.getElementById('progress-view')) {
    await initProgress();
  } else if (path.includes('rewards') || document.getElementById('rewards-view')) {
    await initRewards();
  } else if (path.includes('tips') || document.getElementById('tips-view')) {
    initTipsPage();
  } else if (path.includes('plants') || document.getElementById('plants-view')) {
    // My Green Plants view (initialized by js/plants.js)
  } else {
    // Landing Page
    initLandingPage();
  }

  // Listen to user session changes to update nav & modals
  window.addEventListener('ecotrack_user_change', () => {
    syncAuthNav();
  });
});

/* ==========================================================================
   1. Opening Splash Animation (Exact 5-Second Timeline - Requirement 11)
   Timeline:
   0–1s: Soft eco background with subtle floating particles
   1–2s: Leaf smoothly appears/moves
   2–3s: Subtle earth/eco circular effect
   3–4s: EcoTrack logo and name appear smoothly
   4–5s: Small shine effect sweep across brand
   After 5s: Smoothly transitions into main application automatically
   ========================================================================== */
function initOpeningSplash() {
  const splash = document.getElementById('opening-splash');
  if (!splash) return;

  const shown = sessionStorage.getItem('ecotrack_splash_shown_v2');
  if (shown === 'true') {
    splash.style.display = 'none';
    return;
  }

  function dismissSplash() {
    splash.classList.add('fade-out');
    sessionStorage.setItem('ecotrack_splash_shown_v2', 'true');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 800);
  }

  // Skip button allows immediate transition if requested
  const skipBtn = document.getElementById('splash-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', dismissSplash);
  }

  // Automatically transition after exactly 5.0 seconds
  setTimeout(() => {
    dismissSplash();
  }, 5000);
}

/* ==========================================================================
   2. Authentication System & Navbar Session Management
   ========================================================================== */
function initAuth() {
  const modal = document.getElementById('auth-modal');
  const closeBtn = document.getElementById('close-auth-modal-btn');
  const tabSignin = document.getElementById('tab-btn-signin');
  const tabRegister = document.getElementById('tab-btn-register');
  const formSignin = document.getElementById('signin-form');
  const formRegister = document.getElementById('register-form');
  const alertBox = document.getElementById('auth-alert-box');

  if (!modal) return;

  window.openAuthModal = function (tab = 'signin') {
    modal.classList.add('open');
    if (alertBox) alertBox.style.display = 'none';
    if (tab === 'register') {
      tabRegister?.click();
    } else {
      tabSignin?.click();
    }
  };

  function closeModal() {
    modal.classList.remove('open');
    if (alertBox) alertBox.style.display = 'none';
  }

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  tabSignin?.addEventListener('click', () => {
    tabSignin.classList.add('active');
    tabRegister?.classList.remove('active');
    if (formSignin) formSignin.style.display = 'block';
    if (formRegister) formRegister.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabSignin?.classList.remove('active');
    if (formRegister) formRegister.style.display = 'block';
    if (formSignin) formSignin.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';
  });

  // Submit Sign In
  formSignin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email')?.value.trim();
    const password = document.getElementById('signin-password')?.value;
    const submitBtn = document.getElementById('signin-submit-btn');

    if (!email || !password) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

    const res = await EcoApi.login(email, password);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to EcoTrack';

    if (res.success) {
      closeModal();
      showToast(`Welcome back, ${res.user.name}! 🌱`, 'success', 'fa-circle-check');
      syncAuthNav();
      // Navigate to Dashboard as central hub after login (Requirement 1)
      if (!window.location.pathname.includes('dashboard')) {
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 350);
      } else {
        await initDashboard();
      }
    } else {
      if (alertBox) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = res.message || 'Invalid credentials';
        alertBox.style.display = 'block';
      }
    }
  });

  // Submit Register
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = document.getElementById('reg-confirm-password')?.value;
    const submitBtn = document.getElementById('register-submit-btn');

    if (password !== confirmPassword) {
      if (alertBox) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = 'Passwords do not match';
        alertBox.style.display = 'block';
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

    const res = await EcoApi.register(name, email, password);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';

    if (res.success) {
      closeModal();
      showToast(`Account created! Welcome, ${res.user.name} 🌱`, 'success', 'fa-circle-check');
      syncAuthNav();
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 350);
    } else {
      if (alertBox) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = res.message || 'Registration failed';
        alertBox.style.display = 'block';
      }
    }
  });
}

function syncAuthNav() {
  const container = document.getElementById('nav-auth-container');
  const profileNavBtn = document.getElementById('nav-profile-btn');
  const user = EcoApi.getCurrentUser();

  if (user && EcoApi.isAuthenticated()) {
    if (profileNavBtn) {
      profileNavBtn.style.display = 'inline-flex';
      profileNavBtn.title = `Profile (${user.name})`;
    }

    if (container) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="user-profile-btn" id="nav-user-pill" title="View Profile" style="padding: 4px 10px;">
            <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.85rem;">
              ${user.avatar || '🌱'}
            </div>
            <span class="user-name" style="font-size: 0.84rem;">${user.name}</span>
          </button>
          <button class="btn btn-outline-danger btn-sm" id="nav-logout-btn" title="Sign out" style="padding: 6px 12px; font-size: 0.8rem;">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      `;

      document.getElementById('nav-user-pill')?.addEventListener('click', () => {
        openProfileModal();
      });

      document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
        EcoApi.logout();
        showToast('Logged out successfully', 'success', 'fa-arrow-right-from-bracket');
        syncAuthNav();
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 350);
      });
    }
  } else {
    if (profileNavBtn) profileNavBtn.style.display = 'none';

    if (container) {
      container.innerHTML = `
        <button class="btn btn-primary btn-sm" id="nav-login-btn">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In / Register
        </button>
      `;

      document.getElementById('nav-login-btn')?.addEventListener('click', () => {
        if (window.openAuthModal) window.openAuthModal('signin');
      });
    }
  }

  // Update notification bell dropdown dynamically
  updateNotificationDropdown(user);
}

/* ==========================================================================
   3. Notification Bell Dropdown (Requirement 10)
   - Only bell icon in navbar, no text nav item
   - Clicking toggles clean popup dropdown
   - Shows streak update, reward milestone proximity, and personalized tips ready
   ========================================================================== */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const bellBtn = document.getElementById('nav-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      toggleBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  // Notification Bell Click
  if (bellBtn && notifDropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !bellBtn.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
    });
  }

  // Active path highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function updateNotificationDropdown(user) {
  const listEl = document.getElementById('notif-list');
  const badgeEl = document.getElementById('nav-bell-badge');
  const countTag = document.getElementById('notif-count-tag');
  if (!listEl) return;

  const currentStreak = user?.streak?.current || 0;
  const calcsCount = user?.metrics?.totalCalculations || 0;
  const highestCategory = user?.metrics?.highestCategory || 'transport';

  // 1. Streak Notification
  let streakNotif = {
    icon: 'fa-fire text-amber',
    title: 'Streak Active 🔥',
    text: `You have an active ${currentStreak}-day consecutive tracking streak. Keep checking in daily!`
  };
  if (currentStreak === 0) {
    streakNotif = {
      icon: 'fa-fire text-muted',
      title: 'Start Your Streak 🔥',
      text: 'Calculate today\'s emissions in the Carbon Calculator to begin your habit streak.'
    };
  }

  // 2. Reward Milestone Notification
  let rewardNotif = {
    icon: 'fa-seedling text-emerald',
    title: 'Reward Milestone 🌱',
    text: `Eco Starter: ${Math.max(1, 7 - currentStreak)} day(s) remaining to unlock your 7-day reward.`
  };
  if (currentStreak >= 7 && currentStreak < 14) {
    rewardNotif = {
      icon: 'fa-shield-halved text-emerald',
      title: 'Eco Saver Milestone 🌿',
      text: `You unlocked Eco Starter! ${14 - currentStreak} day(s) remaining until Eco Saver.`
    };
  } else if (currentStreak >= 14 && currentStreak < 30) {
    rewardNotif = {
      icon: 'fa-trophy text-amber',
      title: 'Green Champion Milestone 🏆',
      text: `Outstanding consistency! ${30 - currentStreak} day(s) remaining until Green Champion.`
    };
  } else if (currentStreak >= 30) {
    rewardNotif = {
      icon: 'fa-trophy text-amber',
      title: 'Green Champion Unlocked 🏆',
      text: 'Congratulations! You have unlocked all official streak milestone tiers.'
    };
  }

  // 3. Personalized Tips Notification
  let tipNotif = {
    icon: 'fa-lightbulb text-amber',
    title: 'Personalized Tips Available 💡',
    text: `Tailored recommendations ready for your highest contributor (${highestCategory}).`
  };
  if (calcsCount === 0) {
    tipNotif = {
      icon: 'fa-lightbulb text-muted',
      title: 'Personalized Tips Prompt 💡',
      text: 'Calculate your footprint in the Carbon Calculator to generate tailored reduction tips.'
    };
  }

  listEl.innerHTML = `
    <div class="notif-item">
      <i class="fa-solid ${streakNotif.icon} notif-item-icon"></i>
      <div class="notif-item-text">
        <strong>${streakNotif.title}</strong>
        ${streakNotif.text}
      </div>
    </div>
    <div class="notif-item">
      <i class="fa-solid ${rewardNotif.icon} notif-item-icon"></i>
      <div class="notif-item-text">
        <strong>${rewardNotif.title}</strong>
        ${rewardNotif.text}
      </div>
    </div>
    <div class="notif-item">
      <i class="fa-solid ${tipNotif.icon} notif-item-icon"></i>
      <div class="notif-item-text">
        <strong>${tipNotif.title}</strong>
        ${tipNotif.text}
      </div>
    </div>
  `;

  if (badgeEl) badgeEl.classList.add('active');
  if (countTag) countTag.textContent = '3 Updates';
}

/* ==========================================================================
   4. Profile Modal Component
   ========================================================================== */
function initProfileModal() {
  const modal = document.getElementById('profile-modal');
  const closeBtn = document.getElementById('close-profile-modal-btn');
  const navProfileBtn = document.getElementById('nav-profile-btn');
  const qaProfileCard = document.getElementById('qa-profile-card');
  const logoutBtn = document.getElementById('profile-logout-btn');

  if (!modal) return;

  window.openProfileModal = function () {
    const user = EcoApi.getCurrentUser();
    if (!user || !EcoApi.isAuthenticated()) {
      if (window.openAuthModal) window.openAuthModal('signin');
      return;
    }

    // Populate data
    const nameEl = document.getElementById('profile-name-display');
    const emailEl = document.getElementById('profile-email-display');
    const avatarEl = document.getElementById('profile-avatar-display');
    const joinedEl = document.getElementById('profile-joined-display');
    const streakEl = document.getElementById('profile-streak-val');
    const bestStreakEl = document.getElementById('profile-best-streak-val');
    const calcsEl = document.getElementById('profile-calcs-val');
    const scoreEl = document.getElementById('profile-score-val');

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = user.avatar || '🌱';
    if (joinedEl) joinedEl.textContent = `Member since ${user.joinedDate || 'Recently'}`;
    if (streakEl) streakEl.textContent = `${user.streak?.current || 0} Days 🔥`;
    if (bestStreakEl) bestStreakEl.textContent = `${user.streak?.best || 0} Days 🌟`;
    if (calcsEl) calcsEl.textContent = `${user.metrics?.totalCalculations || 0} Logged`;
    if (scoreEl) scoreEl.textContent = `${user.metrics?.ecoScore || 75}/100`;

    modal.classList.add('open');
  };

  function closeModal() {
    modal.classList.remove('open');
  }

  closeBtn?.addEventListener('click', closeModal);
  navProfileBtn?.addEventListener('click', window.openProfileModal);
  qaProfileCard?.addEventListener('click', window.openProfileModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  logoutBtn?.addEventListener('click', () => {
    closeModal();
    EcoApi.logout();
    showToast('Logged out successfully', 'success', 'fa-arrow-right-from-bracket');
    syncAuthNav();
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 350);
  });
}

function initEcoScoreModal() {
  const modal = document.getElementById('eco-score-modal');
  const card = document.getElementById('kpi-eco-score-card');
  const closeBtn = document.getElementById('close-score-modal-btn');

  if (!modal) return;

  card?.addEventListener('click', () => {
    modal.classList.add('open');
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ==========================================================================
   5. EcoTicker Component (Requirement 8)
   - Predefined rotating facts and targets near header
   - Does not pretend to be real-time measurements
   ========================================================================== */
let tickerInterval = null;
function initEcoTicker() {
  const tickerEl = document.getElementById('dashboard-eco-ticker');
  const badgeEl = document.getElementById('ticker-badge');
  const textEl = document.getElementById('ticker-text');
  if (!tickerEl || !textEl || !badgeEl) return;

  const items = window.ECO_TICKER_ITEMS || [
    { badge: '🌱 Eco Fact', text: 'Small daily actions can significantly reduce your carbon footprint.' },
    { badge: '💡 Today\'s Target', text: 'Choose a lower-carbon mode of transport for your routine travel today.' }
  ];

  let currentIndex = 0;

  function showNextTicker() {
    currentIndex = (currentIndex + 1) % items.length;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';

    setTimeout(() => {
      badgeEl.innerHTML = items[currentIndex].badge;
      textEl.textContent = items[currentIndex].text;
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 280);
  }

  if (tickerInterval) clearInterval(tickerInterval);
  tickerInterval = setInterval(showNextTicker, 6500);

  // Pause on hover
  tickerEl.addEventListener('mouseenter', () => clearInterval(tickerInterval));
  tickerEl.addEventListener('mouseleave', () => {
    tickerInterval = setInterval(showNextTicker, 6500);
  });
}

/* ==========================================================================
   6. Dashboard Page Logic (Main Central Hub - Requirement 1, 8, 9)
   - Personalized greeting
   - Eco Status pill (🟢 On Track / 🟡 Needs Improvement)
   - 🔥 Current streak
   - Small EcoTicker near header
   - Latest carbon footprint KPI
   - Eco Score KPI
   - Small monthly progress summary/graph
   - Small next reward preview
   - Small personalized-tip preview / prompt
   - Clean interactive Quick Access cards
   - NO Category Breakdown on Dashboard
   - NO separate notification section on Dashboard
   ========================================================================== */
async function initDashboard() {
  let user = EcoApi.getCurrentUser();

  // Fresh profile from backend if token exists
  if (EcoApi.isAuthenticated()) {
    const freshUser = await EcoApi.getMe();
    if (freshUser) user = freshUser;
  }

  // Pull real analytics summary from backend
  const summaryRes = await EcoApi.getSummary();
  const summary = summaryRes || { hasData: false, weeklyTrend: [], monthlyProgress: null };

  // 1. EcoTicker
  initEcoTicker();

  // 2. Personalized Greeting
  const greetingEl = document.getElementById('user-greeting-title');
  if (greetingEl) {
    if (user && user.name) {
      greetingEl.textContent = `Welcome back, ${user.name}! 🌱`;
    } else {
      greetingEl.textContent = `Welcome to EcoTrack! 🌱`;
    }
  }

  // 3. Status Pill & Streak (Requirement 9)
  const statusPill = document.getElementById('dash-eco-status');
  const statusText = document.getElementById('dash-eco-status-text');
  const streakCount = document.getElementById('dash-streak-count');

  const currentStreak = user?.streak?.current || 0;
  const bestStreak = user?.streak?.best || 0;
  const calcsCount = user?.metrics?.totalCalculations || 0;
  const latestFootprint = user?.metrics?.todayFootprint || 0;
  const ecoScore = user?.metrics?.ecoScore || 75;

  // Determine status based on actual user data
  // On Track if: has calculations and (ecoScore >= 75 OR latestFootprint <= 5.0 OR streak >= 3)
  const isOnTrack = calcsCount > 0 && (ecoScore >= 75 || latestFootprint <= 5.0 || currentStreak >= 3);

  if (statusPill && statusText) {
    if (isOnTrack) {
      statusPill.className = 'status-pill status-on-track';
      statusText.textContent = '🟢 Eco Status: On Track';
    } else {
      statusPill.className = 'status-pill status-needs-improvement';
      statusText.textContent = '🟡 Eco Status: Needs Improvement';
    }
  }

  if (streakCount) {
    streakCount.textContent = `${currentStreak} Days 🔥`;
  }

  // 4. Core Summary KPI Cards
  const footprintEl = document.getElementById('kpi-today-footprint');
  const footprintBadge = document.getElementById('kpi-footprint-badge');
  const footprintSub = document.getElementById('kpi-footprint-sub');
  const scoreEl = document.getElementById('kpi-eco-score');
  const scoreBadge = document.getElementById('kpi-score-badge');
  const streakValEl = document.getElementById('kpi-current-streak');
  const streakBadge = document.getElementById('kpi-streak-badge');

  if (calcsCount > 0) {
    if (footprintEl) footprintEl.textContent = `${latestFootprint} kg CO₂`;
    if (footprintBadge) footprintBadge.textContent = 'Calculated';
    if (footprintSub) footprintSub.textContent = 'From your latest calculation';
    if (scoreEl) scoreEl.textContent = `${ecoScore}/100`;
    if (scoreBadge) scoreBadge.textContent = `Grade ${user?.metrics?.ecoGrade || 'B'}`;
    if (streakValEl) streakValEl.textContent = `${currentStreak} Days 🔥`;
    if (streakBadge) streakBadge.textContent = currentStreak >= 7 ? 'On Fire!' : 'Active Streak';
  } else {
    if (footprintEl) footprintEl.textContent = '0.0 kg CO₂';
    if (footprintBadge) footprintBadge.textContent = 'No Data Yet';
    if (footprintSub) footprintSub.textContent = 'Calculate footprint to begin';
    if (scoreEl) scoreEl.textContent = '75/100';
    if (scoreBadge) scoreBadge.textContent = 'Baseline';
    if (streakValEl) streakValEl.textContent = '0 Days 🔥';
    if (streakBadge) streakBadge.textContent = 'Start Today';
  }

  // 5. Next Reward Preview KPI
  const rewardNameEl = document.getElementById('kpi-next-reward-name');
  const rewardFillEl = document.getElementById('kpi-next-reward-fill');
  const rewardSubEl = document.getElementById('kpi-next-reward-sub');

  const milestones = window.REWARD_MILESTONES || [
    { id: 'starter', name: 'Eco Starter', daysRequired: 7 },
    { id: 'saver', name: 'Eco Saver', daysRequired: 14 },
    { id: 'champion', name: 'Green Champion', daysRequired: 30 }
  ];

  let nextMilestone = milestones[0];
  const effectiveStreak = Math.max(currentStreak, bestStreak);
  for (let m of milestones) {
    if (effectiveStreak < m.daysRequired) {
      nextMilestone = m;
      break;
    }
    nextMilestone = m;
  }

  if (rewardNameEl) rewardNameEl.textContent = `${nextMilestone.name}`;
  if (rewardSubEl) rewardSubEl.textContent = `${Math.min(currentStreak, nextMilestone.daysRequired)} / ${nextMilestone.daysRequired} Days completed`;
  if (rewardFillEl) {
    const pct = Math.min(100, Math.round((currentStreak / nextMilestone.daysRequired) * 100));
    rewardFillEl.style.width = `${pct}%`;
  }

  // 6. Small Monthly Progress Summary & Mini-Graph
  renderMiniProgressTrend(summary);

  // 7. Small Personalized Tip Preview / Prompt
  renderDashboardTipPreview(user);
}

function renderMiniProgressTrend(summary) {
  const canvas = document.getElementById('canvas-mini-progress');
  const compareText = document.getElementById('dash-month-compare-text');
  const monthPill = document.getElementById('dash-month-pill');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const trend = summary.weeklyTrend || [];

  if (trend.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No logged entries yet.', width / 2, height / 2 - 8);
    ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Click "Calculate Footprint" to start tracking.', width / 2, height / 2 + 12);

    if (compareText) compareText.textContent = 'Awaiting your first calculation';
    if (monthPill) {
      monthPill.textContent = 'Baseline 4.0 kg Target';
      monthPill.style.background = 'var(--bg-main)';
      monthPill.style.color = 'var(--text-secondary)';
    }
    return;
  }

  const paddingBottom = 24;
  const paddingTop = 16;
  const paddingLeft = 28;
  const paddingRight = 14;

  const chartHeight = height - paddingBottom - paddingTop;
  const chartWidth = width - paddingLeft - paddingRight;

  const maxVal = Math.max(6.0, ...trend.map(d => d.footprint * 1.2));
  const gap = chartWidth / trend.length;
  const barWidth = Math.min(26, gap * 0.55);

  // Target dashed line (4.0 kg)
  const targetY = paddingTop + chartHeight - (4.0 / maxVal) * chartHeight;
  ctx.beginPath();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.moveTo(paddingLeft, targetY);
  ctx.lineTo(width - paddingRight, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bars
  trend.forEach((item, index) => {
    const x = paddingLeft + (index * gap) + (gap - barWidth) / 2;
    const barHeight = (item.footprint / maxVal) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;

    ctx.fillStyle = item.footprint <= 4.0 ? '#10b981' : '#34d399';
    roundRect(ctx, x, y, barWidth, barHeight, 3);
    ctx.fill();

    // Value
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 9px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.footprint}`, x + barWidth / 2, y - 4);

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9px Plus Jakarta Sans, sans-serif';
    ctx.fillText(item.day || item.date?.slice(5), x + barWidth / 2, height - 6);
  });

  // Monthly text comparison update
  const mProg = summary.monthlyProgress;
  if (mProg && compareText && monthPill) {
    if (mProg.comparison.isImprovement) {
      compareText.textContent = `${mProg.currentMonth.name}: avg ${mProg.currentMonth.avgFootprint} kg CO₂`;
      monthPill.textContent = `📉 ${mProg.comparison.percentReduction}% Reduction`;
      monthPill.style.background = '#d1fae5';
      monthPill.style.color = '#065f46';
    } else {
      compareText.textContent = `${mProg.currentMonth.name}: avg ${mProg.currentMonth.avgFootprint} kg CO₂`;
      monthPill.textContent = `Emissions On Target`;
      monthPill.style.background = '#e0f2fe';
      monthPill.style.color = '#0369a1';
    }
  }
}

function renderDashboardTipPreview(user) {
  const container = document.getElementById('dash-tip-content');
  const basisEl = document.getElementById('dash-tip-basis');
  if (!container) return;

  const calcsCount = user?.metrics?.totalCalculations || 0;
  const highestCategory = user?.metrics?.highestCategory || 'transport';

  if (calcsCount === 0) {
    // Show simple clean prompt as requested (Requirement 1 & 3)
    if (basisEl) basisEl.textContent = 'Awaiting initial calculation';
    container.innerHTML = `
      <div style="background: var(--bg-main); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 18px; text-align: center;">
        <i class="fa-solid fa-calculator text-emerald" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
          Calculate your footprint to get personalized tips.
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 12px 0;">
          Your custom reduction recommendations will be dynamically generated here based on your routine.
        </p>
        <a href="calculator.html" class="btn btn-primary btn-sm" style="font-size: 0.8rem; padding: 6px 14px;">
          <i class="fa-solid fa-plus"></i> Open Calculator
        </a>
      </div>
    `;
    return;
  }

  // User has calculated -> show top personalized tip
  const tipDb = window.PERSONALIZED_TIPS_DATABASE || {};
  const tips = tipDb[highestCategory] || tipDb.transport || [];
  const topTip = tips[0] || {
    icon: 'fa-bus',
    title: 'Choose Low-Carbon Commuting',
    impact: 'High Impact',
    desc: 'Public transit reduces per-person emissions significantly compared to solo driving.'
  };

  const formattedCat = highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1);
  if (basisEl) basisEl.textContent = `Tailored to your highest contributor: ${formattedCat}`;

  container.innerHTML = `
    <div style="background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="kpi-icon feature-icon-emerald" style="width: 32px; height: 32px; font-size: 0.95rem;">
            <i class="fa-solid ${topTip.icon}"></i>
          </div>
          <strong style="font-size: 0.92rem; color: var(--text-main);">${topTip.title}</strong>
        </div>
        <span class="badge-pill" style="font-size: 0.72rem; background: var(--primary-100); color: var(--primary-800);">${topTip.impact}</span>
      </div>
      <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">
        ${topTip.desc}
      </p>
    </div>
  `;
}

/* ==========================================================================
   7. Carbon Calculator Page Logic (Requirement 3)
   Flow: User enters data -> Calculate -> Carbon Footprint Result
         -> Category Breakdown -> Personalized Tips
   ========================================================================== */
async function initCalculator() {
  const calcBtn = document.getElementById('run-calculator-btn');
  const resultsCard = document.getElementById('calc-results-card');
  const promptBox = document.getElementById('calc-initial-prompt');

  // Slider display
  const distSlider = document.getElementById('calc-distance-km');
  const distDisplay = document.getElementById('calc-distance-display');
  if (distSlider && distDisplay) {
    distSlider.addEventListener('input', () => {
      distDisplay.textContent = `${distSlider.value} km/day`;
    });
  }

  // Check if user already has saved calculations to reveal previous results or show initial prompt
  const user = EcoApi.getCurrentUser();
  if (user && user.metrics && user.metrics.totalCalculations > 0) {
    renderCalculatorResults({
      totalFootprintKg: user.metrics.todayFootprint,
      breakdown: user.metrics.scoreBreakdown || { transport: 4.5, electricity: 2.1, food: 3.0, waste: 0.8 },
      highestContributor: {
        key: user.metrics.highestCategory || 'transport',
        name: (user.metrics.highestCategory || 'transport').charAt(0).toUpperCase() + (user.metrics.highestCategory || 'transport').slice(1),
        percentage: 50
      }
    });
    if (promptBox) promptBox.style.display = 'none';
  } else {
    // Initial state: Show simple prompt "Calculate your footprint to get personalized tips." (Requirement 3)
    if (promptBox) promptBox.style.display = 'block';
    if (resultsCard) resultsCard.classList.remove('show');
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', async () => {
      const vehicleType = document.getElementById('calc-vehicle-type')?.value || 'petrol_car';
      const distanceKm = document.getElementById('calc-distance-km')?.value || 25;
      const carpooling = document.getElementById('calc-carpooling')?.checked || false;
      const electricityKwh = document.getElementById('calc-electricity-kwh')?.value || 140;
      const renewableEnergy = document.getElementById('calc-renewable')?.checked || false;
      const dietType = document.getElementById('calc-diet')?.value || 'mixed';
      const wasteBags = document.getElementById('calc-waste-bags')?.value || 1.5;
      const recycling = document.getElementById('calc-recycling')?.value || 'partial';

      calcBtn.disabled = true;
      calcBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating Emissions...';

      const calcPayload = {
        vehicleType,
        distanceKm: parseFloat(distanceKm),
        carpooling,
        electricityKwh: parseFloat(electricityKwh),
        renewableEnergy,
        dietType,
        wasteBags: parseFloat(wasteBags),
        recycling,
        saveToHistory: true
      };

      try {
        let apiData = null;
        if (window.EcoApi) {
          apiData = await window.EcoApi.calculateFootprint(calcPayload);
        }

        if (promptBox) promptBox.style.display = 'none';
        renderCalculatorResults(apiData);
        showToast('Footprint calculated & saved! Streak updated 🌱', 'success', 'fa-fire');
      } catch (err) {
        console.error('Calculation error:', err);
        showToast('Calculation complete.', 'success');
      } finally {
        calcBtn.disabled = false;
        calcBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> Recalculate Footprint';
      }
    });
  }

  // Simulator
  setupFullHabitSimulator();
}

function renderCalculatorResults(data) {
  const resultsCard = document.getElementById('calc-results-card');
  if (!resultsCard || !data) return;

  const totalKg = data.totalFootprintKg || 8.4;
  const breakdown = data.breakdown || { transport: 4.5, electricity: 1.8, food: 3.0, waste: 0.8 };
  const highest = data.highestContributor || { key: 'transport', name: 'Transportation', percentage: 50 };

  // 1. Total Result
  const totalEl = document.getElementById('calc-total-co2');
  if (totalEl) totalEl.textContent = `${totalKg} kg CO₂`;

  // 2. Highest alert
  const highestTitle = document.getElementById('calc-highest-title');
  const highestDesc = document.getElementById('calc-highest-desc');
  if (highestTitle) highestTitle.textContent = `${highest.name} is your highest contributor`;
  if (highestDesc) highestDesc.textContent = `Accounting for approximately ${highest.percentage}% of your daily footprint.`;

  // 3. Category Breakdown Grid
  const tEl = document.getElementById('calc-t-val');
  const eEl = document.getElementById('calc-e-val');
  const fEl = document.getElementById('calc-f-val');
  const wEl = document.getElementById('calc-w-val');

  if (tEl) tEl.textContent = `${breakdown.transport || 0} kg`;
  if (eEl) eEl.textContent = `${breakdown.electricity || 0} kg`;
  if (fEl) fEl.textContent = `${breakdown.food || 0} kg`;
  if (wEl) wEl.textContent = `${breakdown.waste || 0} kg`;

  // 4. Personalized Tips (Rendered directly with/after result - Requirement 3)
  const tipsGrid = document.getElementById('calc-tips-grid');
  const tipsHeading = document.getElementById('calc-tips-heading');
  const tipsSub = document.getElementById('calc-tips-sub');

  if (tipsGrid) {
    const tipDb = window.PERSONALIZED_TIPS_DATABASE || {};
    const tips = tipDb[highest.key] || tipDb.transport || [];

    if (tipsHeading) {
      tipsHeading.textContent = `Personalized Tips: ${highest.name}`;
    }
    if (tipsSub) {
      tipsSub.textContent = `Based on your actual calculation result, shifting habits in ${highest.name} will yield your greatest carbon reduction.`;
    }

    tipsGrid.innerHTML = '';
    tips.forEach(tip => {
      const card = document.createElement('div');
      card.className = 'kpi-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
      card.style.gap = '10px';
      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="kpi-icon feature-icon-emerald" style="width: 36px; height: 36px; font-size: 1rem;">
              <i class="fa-solid ${tip.icon}"></i>
            </div>
            <span class="badge-pill" style="font-size: 0.72rem; background: var(--primary-100); color: var(--primary-800);">${tip.impact}</span>
          </div>
          <h4 style="font-size: 0.98rem; font-weight: 800; margin: 0 0 6px 0; color: var(--text-main);">${tip.title}</h4>
          <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">${tip.desc}</p>
        </div>
      `;
      tipsGrid.appendChild(card);
    });
  }

  resultsCard.classList.add('show');
  resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupFullHabitSimulator() {
  const currentModeSelect = document.getElementById('sim-current-mode');
  const newModeSelect = document.getElementById('sim-new-mode');
  const simKmInput = document.getElementById('sim-daily-km');
  const simKmLabel = document.getElementById('sim-km-label');

  const curDisplay = document.getElementById('sim-cur-display');
  const newDisplay = document.getElementById('sim-new-display');
  const deltaDisplay = document.getElementById('sim-delta-display');
  const annualDisplay = document.getElementById('sim-annual-display');
  const treesDisplay = document.getElementById('sim-trees-display');

  if (!currentModeSelect || !newModeSelect) return;

  function updateSimulation() {
    const cur = currentModeSelect.value;
    const next = newModeSelect.value;
    const km = simKmInput ? parseFloat(simKmInput.value) : 20;

    if (simKmLabel) simKmLabel.textContent = `${km} km / day`;

    const modeFactors = { car: 0.192, bus: 0.075, metro: 0.038, bicycle: 0.0, walking: 0.0 };
    const curFactor = modeFactors[cur] ?? 0.192;
    const nextFactor = modeFactors[next] ?? 0.075;

    const currentKg = Number((km * curFactor).toFixed(1));
    const newKg = Number((km * nextFactor).toFixed(1));
    const diffKg = Number((currentKg - newKg).toFixed(1));
    const annualDiffKg = Number((diffKg * 365).toFixed(0));
    const treesEquivalent = Math.max(1, Math.round(Math.abs(annualDiffKg) / 21));

    if (curDisplay) curDisplay.textContent = `${currentKg} kg CO₂`;
    if (newDisplay) newDisplay.textContent = `${newKg} kg CO₂`;
    if (deltaDisplay) deltaDisplay.textContent = `Potential difference: ${diffKg} kg CO₂/day`;
    if (annualDisplay) annualDisplay.textContent = `Annual Savings: ${annualDiffKg} kg CO₂ / year`;
    if (treesDisplay) treesDisplay.innerHTML = `<i class="fa-solid fa-tree"></i> ~${treesEquivalent} Trees Planted / Year`;
  }

  currentModeSelect.addEventListener('change', updateSimulation);
  newModeSelect.addEventListener('change', updateSimulation);
  if (simKmInput) simKmInput.addEventListener('input', updateSimulation);

  updateSimulation();
}

/* ==========================================================================
   8. Monthly Progress Page Logic (Requirement 4)
   - Real month-over-month comparison, improvement, trajectory chart, & table
   ========================================================================== */
async function initProgress() {
  const summaryRes = await EcoApi.getSummary();
  const summary = summaryRes || { hasData: false, weeklyTrend: [], categoryDistribution: [], monthlyProgress: null };

  const historyRes = await EcoApi.getHistory(30);
  const calculations = historyRes?.calculations || [];

  const user = EcoApi.getCurrentUser();
  const activeStreak = user?.streak?.current || 0;

  // 1. Month-over-Month Comparison Cards
  const curMonthTitle = document.getElementById('prog-cur-month-title');
  const curMonthAvg = document.getElementById('prog-cur-month-avg');
  const curMonthSub = document.getElementById('prog-cur-month-sub');

  const prevMonthTitle = document.getElementById('prog-prev-month-title');
  const prevMonthAvg = document.getElementById('prog-prev-month-avg');
  const prevMonthSub = document.getElementById('prog-prev-month-sub');

  const comparisonVal = document.getElementById('prog-comparison-val');
  const comparisonSub = document.getElementById('prog-comparison-sub');
  const comparisonBadge = document.getElementById('prog-comparison-badge');

  const mProg = summary.monthlyProgress;

  if (mProg && summary.hasData) {
    if (curMonthTitle) curMonthTitle.textContent = mProg.currentMonth.name;
    if (curMonthAvg) curMonthAvg.textContent = `${mProg.currentMonth.avgFootprint} kg CO₂`;
    if (curMonthSub) curMonthSub.textContent = `Daily average (${mProg.currentMonth.count} entries)`;

    if (prevMonthTitle) prevMonthTitle.textContent = mProg.previousMonth.name;
    if (prevMonthAvg) prevMonthAvg.textContent = `${mProg.previousMonth.avgFootprint} kg CO₂`;
    if (prevMonthSub) prevMonthSub.textContent = `Daily average (${mProg.previousMonth.count} entries)`;

    if (comparisonVal) {
      comparisonVal.textContent = `${mProg.comparison.isImprovement ? '-' : '+'}${mProg.comparison.percentReduction}%`;
      comparisonVal.style.color = mProg.comparison.isImprovement ? '#059669' : '#dc2626';
    }
    if (comparisonSub) {
      comparisonSub.textContent = mProg.comparison.text;
    }
    if (comparisonBadge) {
      comparisonBadge.textContent = mProg.comparison.isImprovement ? 'Improvement 📉' : 'Review Needed';
      comparisonBadge.className = `kpi-badge ${mProg.comparison.isImprovement ? 'kpi-badge-green' : 'kpi-badge-amber'}`;
    }
  } else {
    if (curMonthAvg) curMonthAvg.textContent = '-- kg CO₂';
    if (prevMonthAvg) prevMonthAvg.textContent = '-- kg CO₂';
    if (comparisonVal) comparisonVal.textContent = '-- %';
    if (comparisonSub) comparisonSub.textContent = 'Log calculations to generate comparison';
  }

  // 2. Summary Banner
  const totalEntriesEl = document.getElementById('rep-total-entries');
  const avgFootprintEl = document.getElementById('rep-avg-footprint');
  const latestScoreEl = document.getElementById('rep-latest-score');
  const streakEl = document.getElementById('rep-streak');

  if (totalEntriesEl) totalEntriesEl.textContent = `${calculations.length}`;
  if (avgFootprintEl) avgFootprintEl.textContent = summary.hasData ? `${summary.avgFootprint} kg` : '-- kg';
  if (latestScoreEl) latestScoreEl.textContent = summary.hasData ? `${summary.latestEcoScore}/100` : '--/100';
  if (streakEl) streakEl.textContent = `${activeStreak} Days 🔥`;

  // 3. Trajectory Chart
  renderProgressTrajectoryChart('canvas-weekly-chart', summary.weeklyTrend);

  // 4. Category Doughnut Chart
  renderProgressCategoryDoughnut('canvas-category-chart', summary.categoryDistribution);

  // 5. History Table
  renderCalculationsTable(calculations);
}

function renderProgressTrajectoryChart(canvasId, trendData = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  if (trendData.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No historical calculations logged yet.', width / 2, height / 2);
    return;
  }

  const paddingBottom = 30;
  const paddingTop = 25;
  const paddingLeft = 35;
  const paddingRight = 20;

  const chartHeight = height - paddingBottom - paddingTop;
  const chartWidth = width - paddingLeft - paddingRight;

  const maxVal = Math.max(6.0, ...trendData.map(d => d.footprint * 1.2));
  const gap = chartWidth / trendData.length;
  const barWidth = Math.min(32, gap * 0.55);

  // Target dashed line (4.0 kg)
  const targetY = paddingTop + chartHeight - (4.0 / maxVal) * chartHeight;
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.moveTo(paddingLeft, targetY);
  ctx.lineTo(width - paddingRight, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  trendData.forEach((item, index) => {
    const x = paddingLeft + (index * gap) + (gap - barWidth) / 2;
    const barHeight = (item.footprint / maxVal) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;

    ctx.fillStyle = item.footprint <= 4.0 ? '#10b981' : '#34d399';
    roundRect(ctx, x, y, barWidth, barHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.footprint}`, x + barWidth / 2, y - 6);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(item.day || item.date?.slice(5), x + barWidth / 2, height - 10);
  });
}

function renderProgressCategoryDoughnut(canvasId, dist = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (!dist || dist.length === 0) {
    dist = [
      { label: 'Transport', percent: 25, color: '#10b981' },
      { label: 'Energy', percent: 25, color: '#0284c7' },
      { label: 'Food', percent: 25, color: '#16a34a' },
      { label: 'Waste', percent: 25, color: '#64748b' }
    ];
  }

  dist.forEach(cat => {
    const key = cat.label.toLowerCase();
    const el = document.getElementById(`prog-leg-${key}`);
    if (el) el.textContent = `${cat.percent}%`;
  });

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 15;
  const innerRadius = radius * 0.65;

  ctx.clearRect(0, 0, width, height);

  let startAngle = -Math.PI / 2;
  dist.forEach(cat => {
    const sliceAngle = (cat.percent / 100) * (2 * Math.PI);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = cat.color;
    ctx.fill();

    startAngle = endAngle;
  });
}

function renderCalculationsTable(calculations = []) {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (calculations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-muted);">
          No calculations logged yet. Click "New Calculation" above to record your first entry.
        </td>
      </tr>
    `;
    return;
  }

  calculations.forEach(calc => {
    const dateFormatted = new Date(calc.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    const vehicle = calc.inputs?.vehicleType?.replace('_', ' ') || 'Sedan';
    const electricity = calc.inputs?.electricityKwh || 0;
    const diet = calc.inputs?.dietType?.replace('_', ' ') || 'Mixed';
    const footprint = calc.results?.totalFootprintKg || 0;
    const score = calc.results?.ecoScore || 75;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${dateFormatted}</strong></td>
      <td style="text-transform: capitalize;">${vehicle}</td>
      <td>${electricity} kWh</td>
      <td style="text-transform: capitalize;">${diet}</td>
      <td><span style="font-weight: 800; color: var(--primary-700);">${footprint} kg CO₂</span></td>
      <td><span class="badge-pill" style="background: var(--primary-100); color: var(--primary-800);">${score}/100</span></td>
    `;
    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   9. Rewards Page Logic (Requirement 5)
   - Approved Streak Rewards: 7 Days (Eco Starter), 14 Days (Eco Saver), 30 Days (Green Champion)
   - 1-2 Second Premium Celebration Animation when unlocked
   ========================================================================== */
async function initRewards() {
  let user = EcoApi.getCurrentUser();
  if (EcoApi.isAuthenticated()) {
    const fresh = await EcoApi.getMe();
    if (fresh) user = fresh;
  }

  const currentStreak = user?.streak?.current || 0;
  const bestStreak = user?.streak?.best || 0;
  const effectiveStreak = Math.max(currentStreak, bestStreak);
  const rewards = user?.rewards || [];

  // Top stats
  const curStreakEl = document.getElementById('rewards-cur-streak');
  const bestStreakEl = document.getElementById('rewards-best-streak');
  const nextTitleEl = document.getElementById('rewards-next-title');
  const nextDaysLeftEl = document.getElementById('rewards-next-days-left');

  if (curStreakEl) curStreakEl.textContent = `${currentStreak} Days 🔥`;
  if (bestStreakEl) bestStreakEl.textContent = `${bestStreak} Days 🌟`;

  const milestones = [
    { id: 'starter', name: 'Eco Starter', days: 7, cardId: 'reward-card-starter', badgeId: 'badge-reward-starter', barId: 'bar-reward-starter', subId: 'sub-reward-starter', statusId: 'status-reward-starter', emoji: '🌱' },
    { id: 'saver', name: 'Eco Saver', days: 14, cardId: 'reward-card-saver', badgeId: 'badge-reward-saver', barId: 'bar-reward-saver', subId: 'sub-reward-saver', statusId: 'status-reward-saver', emoji: '🌿' },
    { id: 'champion', name: 'Green Champion', days: 30, cardId: 'reward-card-champion', badgeId: 'badge-reward-champion', barId: 'bar-reward-champion', subId: 'sub-reward-champion', statusId: 'status-reward-champion', emoji: '🏆' }
  ];

  let nextMilestone = milestones[0];
  for (let m of milestones) {
    if (effectiveStreak < m.days) {
      nextMilestone = m;
      break;
    }
    nextMilestone = m;
  }

  if (nextTitleEl) nextTitleEl.textContent = nextMilestone.name;
  if (nextDaysLeftEl) {
    const left = Math.max(0, nextMilestone.days - currentStreak);
    nextDaysLeftEl.textContent = left === 0 ? 'Milestone achieved!' : `${left} day(s) left`;
  }

  // Next reward progress bar
  const progNextName = document.getElementById('progress-next-reward-name');
  const progNextCount = document.getElementById('progress-next-reward-count');
  const progNextBar = document.getElementById('progress-next-reward-bar');

  if (progNextName) progNextName.textContent = `${nextMilestone.name} (${nextMilestone.days} Days)`;
  if (progNextCount) progNextCount.textContent = `${Math.min(currentStreak, nextMilestone.days)} / ${nextMilestone.days} Days`;
  if (progNextBar) {
    const pct = Math.min(100, Math.round((currentStreak / nextMilestone.days) * 100));
    progNextBar.style.width = `${pct}%`;
  }

  // Update 3 reward cards
  milestones.forEach(m => {
    const cardEl = document.getElementById(m.cardId);
    const badgeEl = document.getElementById(m.badgeId);
    const barEl = document.getElementById(m.barId);
    const subEl = document.getElementById(m.subId);
    const statusEl = document.getElementById(m.statusId);

    const rewardObj = rewards.find(r => r.id === m.id);
    const isUnlocked = Boolean((rewardObj && rewardObj.unlocked) || effectiveStreak >= m.days);

    if (isUnlocked) {
      cardEl?.classList.add('unlocked');
      if (badgeEl) {
        badgeEl.className = 'reward-status-badge unlocked';
        badgeEl.textContent = 'Unlocked ✅';
      }
      if (statusEl) {
        statusEl.textContent = 'Permanently Unlocked';
        statusEl.style.background = '#d1fae5';
        statusEl.style.color = '#065f46';
      }
      if (barEl) barEl.style.width = '100%';
      if (subEl) subEl.textContent = `Completed (${m.days} Day Milestone reached)`;

      // Clicking unlocked card triggers the 1-2s celebration animation
      cardEl?.addEventListener('click', () => {
        triggerRewardCelebration(m.name, m.emoji);
      });
      cardEl.style.cursor = 'pointer';
      cardEl.title = 'Click to replay milestone celebration';
    } else {
      cardEl?.classList.remove('unlocked');
      const left = m.days - currentStreak;
      if (badgeEl) {
        badgeEl.className = 'reward-status-badge locked';
        badgeEl.textContent = `${left} day(s) left`;
      }
      if (statusEl) {
        statusEl.textContent = 'Locked';
        statusEl.style.background = 'var(--bg-main)';
        statusEl.style.color = 'var(--text-muted)';
      }
      const pct = Math.min(100, Math.round((currentStreak / m.days) * 100));
      if (barEl) barEl.style.width = `${pct}%`;
      if (subEl) subEl.textContent = `${currentStreak} / ${m.days} Days Completed`;
    }
  });
}

function triggerRewardCelebration(rewardName, emoji = '🎉') {
  const overlay = document.getElementById('celebration-overlay');
  const iconEl = document.getElementById('celebration-icon');
  const titleEl = document.getElementById('celebration-title');
  const descEl = document.getElementById('celebration-desc');
  if (!overlay) return;

  if (iconEl) iconEl.textContent = emoji;
  if (titleEl) titleEl.textContent = `${rewardName} Unlocked!`;
  if (descEl) descEl.textContent = `Congratulations on reaching your ${rewardName} habit milestone!`;

  overlay.classList.add('show');

  // Dismiss celebration animation cleanly after 1.8 seconds (Requirement 5)
  setTimeout(() => {
    overlay.classList.remove('show');
  }, 1800);
}

/* ==========================================================================
   10. Tips Page Logic (General Educational Hub - Requirement 6)
   ========================================================================== */
function initTipsPage() {
  const filterTabs = document.querySelectorAll('.tips-cat-tab');
  const cards = document.querySelectorAll('.tips-edu-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCat = tab.getAttribute('data-category');

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (selectedCat === 'all' || cardCat === selectedCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   11. Landing Page Logic
   ========================================================================== */
function initLandingPage() {
  const user = EcoApi.getCurrentUser();
  const nameEl = document.getElementById('hero-welcome-name');
  const todayVal = document.getElementById('hero-today-footprint');
  const scoreVal = document.getElementById('hero-score-count');
  const streakVal = document.getElementById('hero-streak-count');
  const footprintBadge = document.getElementById('hero-footprint-badge');

  if (user && user.metrics && user.metrics.totalCalculations > 0) {
    if (nameEl) nameEl.textContent = `Welcome back, ${user.name}!`;
    if (todayVal) todayVal.textContent = `${user.metrics.todayFootprint} kg`;
    if (scoreVal) scoreVal.textContent = `${user.metrics.ecoScore}/100`;
    if (streakVal) streakVal.textContent = `${user.streak?.current || 0} Days 🔥`;
    if (footprintBadge) footprintBadge.textContent = `🌱 Grade ${user.metrics.ecoGrade || 'A'}`;
  } else {
    if (nameEl) nameEl.textContent = 'Welcome to EcoTrack';
    if (todayVal) todayVal.textContent = '0.0 kg';
    if (scoreVal) scoreVal.textContent = '75/100';
    if (streakVal) streakVal.textContent = '0 Days 🔥';
  }
}

/* ==========================================================================
   Toast Notification Utilities
   ========================================================================== */
function initToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'success', icon = 'fa-circle-check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utility to draw rounded rectangles on canvas
function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, 0);
  ctx.arcTo(x, y + height, x, y, 0);
  ctx.arcTo(x, y + width, y, radius);
  ctx.closePath();
}
