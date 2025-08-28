import Member from '../models/Member.js';
import dayjs from 'dayjs';
import { addMonths, daysRemaining, clampMonths } from '../utils/dates.js';

const annotate = (m) => {
  const remaining = daysRemaining(m.membershipExpiryDate);
  const expiredDays = remaining < 0 ? Math.abs(remaining) : 0;
  const expiringSoon = remaining >= 0 && remaining <= 5;
  const status = remaining < 0 ? 'expired' : (expiringSoon ? 'expiring' : 'active');
  return { ...m, remaining, expiredDays, expiringSoon, status };
};

export const dashboard = async (req, res) => {
  const members = await Member.find({}).sort({ name: 1 }).lean();
  const annotated = members.map(annotate);
  res.render('dashboard', { title: 'Dashboard', members: annotated });
};

export const listExpiring = async (req, res) => {
  const all = await Member.find({}).sort({ name: 1 }).lean();
  const expiring = all.map(annotate).filter(m => m.expiringSoon && m.remaining >= 0);
  res.render('expiring', { title: 'Expiring Soon', members: expiring });
};

export const listExpired = async (req, res) => {
  const all = await Member.find({}).sort({ name: 1 }).lean();
  const expired = all.map(annotate).filter(m => m.remaining < 0);
  res.render('expired', { title: 'Expired', members: expired });
};

export const getAddMember = (req, res) => {
  res.render('members_add', { title: 'Add Member' });
};

export const postAddMember = async (req, res) => {
  try {
    const { name, phone, location, joiningDate, months, dueAmount } = req.body;
    const paymentDone = req.body.paymentDone || 0;   // ✅ FIXED

    const monthsInt = clampMonths(months);
    const jDate = joiningDate ? dayjs(joiningDate).toDate() : new Date();
    const expiry = addMonths(jDate, monthsInt);
    const created = await Member.create({
      name, phone, location,
      joiningDate: jDate,
      lastPaidDate: jDate,
      membershipExpiryDate: expiry,
      dueAmount: Number(dueAmount || 0),
      paymentDone: Number(paymentDone || 0)   // ✅ FIXED
    });
    req.flash('success', `Member added. Expires on ${dayjs(expiry).format('YYYY-MM-DD')}.`);
    return res.redirect('/members/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add member.');
    return res.redirect('/members/add');
  }
};

export const getEditMember = async (req, res) => {
  const member = await Member.findById(req.params.id).lean();
  if (!member) {
    req.flash('error', 'Member not found');
    return res.redirect('/members/dashboard');
  }
  const annotatedMember = annotate(member);
  res.render('members_edit', { title: 'Edit Member', member: annotatedMember });
};

export const postEditMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      req.flash('error', 'Member not found');
      return res.redirect('/members/dashboard');
    }
    const { name, phone, location, dueAmount, extendMonths } = req.body;
    const paymentDone = req.body.paymentDone || 0;   // ✅ FIXED

    member.name = name;
    member.phone = phone;
    member.location = location;
    member.dueAmount = Number(dueAmount || 0);
    member.paymentDone = Number(paymentDone || 0);   // ✅ FIXED

    // Extend active membership by X months (1-12) if provided
    if (extendMonths) {
      const monthsInt = clampMonths(extendMonths);
      const now = dayjs().startOf('day');
      const expiry = dayjs(member.membershipExpiryDate).startOf('day');
      if (expiry.isAfter(now) || expiry.isSame(now)) {
        // active: add months to current expiry
        member.membershipExpiryDate = expiry.add(monthsInt, 'month').toDate();
      } else {
        // expired but edit route: treat as extend from today
        member.joiningDate = now.toDate();
        member.lastPaidDate = now.toDate();
        member.membershipExpiryDate = now.add(monthsInt, 'month').toDate();
      }
    }

    await member.save();
    req.flash('success', 'Member updated successfully');
    return res.redirect('/members/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update member');
    return res.redirect(`/members/${req.params.id}/edit`);
  }
};

export const postDeleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    req.flash('success', 'Member deleted');
  } catch (e) {
    req.flash('error', 'Failed to delete');
  }
  return res.redirect('/members/dashboard');
};

export const postExtendExpired = async (req, res) => {
  try {
    const { id } = req.params;
    const { months } = req.body;
    const m = await Member.findById(id);
    if (!m) {
      req.flash('error', 'Member not found');
      return res.redirect('/members/dashboard');
    }
    const monthsInt = clampMonths(months);
    const now = dayjs().startOf('day');
    m.joiningDate = now.toDate();
    m.lastPaidDate = now.toDate();
    m.membershipExpiryDate = now.add(monthsInt, 'month').toDate();
    await m.save();
    req.flash('success', `Membership extended by ${monthsInt} month(s).`);
    return res.redirect('/members/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to extend membership');
    return res.redirect('/members/dashboard');
  }
};

export const stats = async (req, res) => {
  const totalUsers = await Member.countDocuments({});
  const members = await Member.find({}).lean();
  const now = dayjs().startOf('day');
  let expiringSoon = 0, expired = 0;
  for (const m of members) {
    const diff = dayjs(m.membershipExpiryDate).startOf('day').diff(now, 'day');
    if (diff < 0) expired++;
    else if (diff <= 5) expiringSoon++;
  }
  res.json({ totalUsers, expiringSoon, expired });
};
