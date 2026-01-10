# Integration Testing - Quick Reference

## Access Testing

**Settings → Testing Tab**

## Run Tests

Click **"Run All Tests"** button

## Test Workflows

1. **Guest Check-in to Check-out** - Complete guest journey
2. **Restaurant Order to Folio** - F&B order processing
3. **Room Revenue to Finance** - Revenue accounting
4. **Procurement to Inventory** - Purchase to stock flow
5. **Maintenance Request Flow** - Work order lifecycle
6. **Channel Manager Sync** - OTA integration
7. **Guest Loyalty & CRM** - CRM and marketing
8. **HR & Payroll Integration** - Payroll processing

## Results

- ✅ **Green** = Passed
- ❌ **Red** = Failed
- ⏱️ **Blue Spinner** = Running
- **Click test card** to expand steps

## Average Runtime

~20 seconds for all 8 tests

## When to Run

- Before major deployments
- After system configuration changes
- Weekly quality checks
- After data migrations
- When troubleshooting issues

## Common Issues

**All tests failing?**
- Check system configuration
- Verify sample data exists
- Review error messages

**Specific test failing?**
- Expand test steps
- Identify failure point
- Check related module settings

## Files

- Test Runner: `/src/tests/integration/test-runner.tsx`
- Workflows: `/src/tests/integration/workflows/`
- Documentation: `/INTEGRATION_TESTING_GUIDE.md`

## Test Data

All tests use:
- Auto-generated IDs (no conflicts)
- Realistic sample data
- Proper validation rules
- No impact on production data
